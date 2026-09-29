import { screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { findItem } from '../../test/mocks/fixtures';
import { createGate } from '../../test/mocks/gate';
import { server } from '../../test/mocks/server';
import { renderRoute } from '../../test/renderRoute';

const productSection = async () =>
  (await screen.findByRole('heading', { level: 2, name: 'Перчатки мужские №1' })).closest(
    'section',
  )!;

describe('Страница товара', () => {
  it('пока грузится — лоадер', async () => {
    const { gate, release } = createGate();
    server.use(
      http.get('*/api/items/:id', async () => {
        await gate;
        return HttpResponse.json(findItem(100));
      }),
    );
    renderRoute('/catalog/100.html');

    expect(await screen.findByRole('status', { name: 'Загрузка товара' })).toBeInTheDocument();
    release();
    await productSection();
    expect(screen.queryByRole('status', { name: 'Загрузка товара' })).not.toBeInTheDocument();
  });

  it('первая картинка и характеристики из описания бренда; отсутствующее поле пустое', async () => {
    renderRoute('/catalog/100.html');
    const section = await productSection();

    expect(within(section).getByRole('img', { name: 'Перчатки мужские №1' })).toHaveAttribute(
      'src',
      'https://img.test/100.jpg',
    );
    const rows = within(section)
      .getAllByRole('row')
      .map((row) => Array.from((row as HTMLTableRowElement).cells).map((cell) => cell.textContent));
    expect(rows).toEqual([
      ['Артикул', 'SKU-100'],
      ['Кожа', 'Овчина'],
      ['Подкладка', ''],
    ]);
    expect(document.title).toBe('Перчатки мужские №1 — Перчатки & Ко');
  });

  it('только доступные размеры, по умолчанию ни один не выбран, кнопка неактивна', async () => {
    const { user } = renderRoute('/catalog/100.html');
    const section = await productSection();
    const sizes = within(section).getByRole('group', { name: 'Размеры перчаток:' });

    expect(
      within(sizes)
        .getAllByRole('button')
        .map((button) => button.textContent),
    ).toEqual(['7', '9']);
    const addButton = within(section).getByRole('button', { name: 'В корзину' });
    expect(addButton).toBeDisabled();

    await user.click(within(sizes).getByRole('button', { name: '9' }));
    expect(within(sizes).getByRole('button', { name: '9' })).toHaveClass('selected');
    expect(addButton).toBeEnabled();

    // Размер можно выбрать только один
    await user.click(within(sizes).getByRole('button', { name: '7' }));
    expect(within(sizes).getByRole('button', { name: '9' })).not.toHaveClass('selected');
    expect(within(sizes).getByRole('button', { name: '7' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('количество от 1 до лимита магазина', async () => {
    const { user } = renderRoute('/catalog/100.html');
    const section = await productSection();
    const minus = within(section).getByRole('button', { name: 'Уменьшить количество' });
    const plus = within(section).getByRole('button', { name: 'Увеличить количество' });
    const value = within(within(section).getByRole('group', { name: 'Количество' })).getByRole(
      'status',
    );

    expect(minus).toBeDisabled();
    for (let i = 0; i < 6; i += 1) {
      if (!plus.hasAttribute('disabled')) await user.click(plus);
    }
    expect(value).toHaveTextContent('5');
    expect(plus).toBeDisabled();
    await user.click(minus);
    expect(value).toHaveTextContent('4');
  });

  it('«В корзину» — позиция в корзине и переход на /cart.html', async () => {
    const { user, router, cartStorage } = renderRoute('/catalog/100.html');
    const section = await productSection();

    await user.click(within(section).getByRole('button', { name: '9' }));
    await user.click(within(section).getByRole('button', { name: 'Увеличить количество' }));
    await user.click(within(section).getByRole('button', { name: 'В корзину' }));

    expect(router.state.location.pathname).toBe('/cart.html');
    expect(screen.getByRole('link', { name: 'Корзина, позиций: 1' })).toBeInTheDocument();
    expect(cartStorage.current).toEqual([
      {
        productId: 100,
        variantId: '9',
        variantLabel: '9',
        title: 'Перчатки мужские №1',
        price: 1000,
        quantity: 2,
      },
    ]);
  });

  it('тот же размер повторно — одна позиция; другой размер — новая', async () => {
    const { user, router, cartStorage } = renderRoute('/catalog/100.html');

    const addSize = async (size: string) => {
      const section = await productSection();
      await user.click(within(section).getByRole('button', { name: size }));
      await user.click(within(section).getByRole('button', { name: 'В корзину' }));
      await router.navigate('/catalog/100.html');
    };

    await addSize('7');
    await addSize('7');
    await addSize('9');

    expect(cartStorage.current.map(({ variantId, quantity }) => [variantId, quantity])).toEqual([
      ['7', 2],
      ['9', 1],
    ]);
    expect(screen.getByRole('link', { name: 'Корзина, позиций: 2' })).toBeInTheDocument();
  });

  it('нет доступных размеров — ни количества, ни кнопки', async () => {
    renderRoute('/catalog/300.html');
    const heading = await screen.findByRole('heading', { name: 'Перчатки распроданные' });
    const section = heading.closest('section')!;

    expect(within(section).getByText('Нет в наличии')).toBeInTheDocument();
    expect(within(section).queryByRole('button', { name: 'В корзину' })).not.toBeInTheDocument();
    expect(within(section).queryByText(/Количество/)).not.toBeInTheDocument();
  });

  it('сервер ответил 404 — «Товар не найден»', async () => {
    renderRoute('/catalog/999.html');
    expect(await screen.findByRole('heading', { name: 'Товар не найден' })).toBeInTheDocument();
  });

  it('сбой сервера — ошибка с повтором без перезагрузки', async () => {
    server.use(
      http.get('*/api/items/:id', () => new HttpResponse(null, { status: 500 }), { once: true }),
    );
    const { user } = renderRoute('/catalog/100.html');

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Не удалось загрузить товар.');
    await user.click(within(alert).getByRole('button', { name: 'Повторить' }));
    await productSection();
  });
});
