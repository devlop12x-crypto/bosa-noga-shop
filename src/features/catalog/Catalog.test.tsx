import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { createGate } from '../../test/mocks/gate';
import { recordItemsRequests } from '../../test/mocks/requestLog';
import { server } from '../../test/mocks/server';
import { renderRoute } from '../../test/renderRoute';

const catalogSection = async () =>
  (await screen.findByRole('heading', { level: 2, name: 'Каталог' })).closest('section')!;

const productTitles = (section: HTMLElement) =>
  Array.from(section.querySelectorAll('.catalog-item-card .card-text:first-of-type')).map(
    (node) => node.textContent,
  );

describe('Каталог на главной', () => {
  it('«Все» активна по умолчанию, первая порция — 6 товаров', async () => {
    renderRoute('/');
    const section = await catalogSection();

    const all = await within(section).findByRole('button', { name: 'Все' });
    expect(all).toHaveClass('active');
    expect(all).toHaveAttribute('aria-pressed', 'true');

    await within(section).findByText('Перчатки мужские №6');
    expect(productTitles(section)).toHaveLength(6);
  });

  it('«Загрузить ещё» догружает по 6 и пропадает на неполной порции', async () => {
    const requests = recordItemsRequests();
    const { user } = renderRoute('/');
    const section = await catalogSection();
    await within(section).findByText('Перчатки мужские №6');

    await user.click(within(section).getByRole('button', { name: 'Загрузить ещё' }));
    await within(section).findByText('Перчатки женские №4');
    expect(productTitles(section)).toHaveLength(12);

    await user.click(within(section).getByRole('button', { name: 'Загрузить ещё' }));
    await within(section).findByText('Перчатки женские №6');
    expect(productTitles(section)).toHaveLength(14);
    expect(
      within(section).queryByRole('button', { name: 'Загрузить ещё' }),
    ).not.toBeInTheDocument();

    expect(requests.map((params) => params.get('offset'))).toEqual([null, '6', '12']);
  });

  it('пока грузится следующая порция — лоадер над кнопкой, кнопка отключена', async () => {
    const { gate, release } = createGate();
    const { user } = renderRoute('/');
    const section = await catalogSection();
    await within(section).findByText('Перчатки мужские №6');

    server.use(
      http.get(
        '*/api/items',
        async () => {
          await gate;
          return HttpResponse.json([]);
        },
        { once: true },
      ),
    );
    await user.click(within(section).getByRole('button', { name: 'Загрузить ещё' }));

    const loader = await within(section).findByRole('status', {
      name: 'Загрузка следующих товаров',
    });
    const button = within(section).getByRole('button', { name: 'Загрузить ещё' });
    expect(button).toBeDisabled();
    // Лоадер над кнопкой, как в задании
    expect(loader.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    release();
    await waitFor(() =>
      expect(
        within(section).queryByRole('button', { name: 'Загрузить ещё' }),
      ).not.toBeInTheDocument(),
    );
  });

  it('смена категории: новый запрос с categoryId, старые товары не остаются', async () => {
    const requests = recordItemsRequests();
    const { user } = renderRoute('/');
    const section = await catalogSection();
    await within(section).findByText('Перчатки мужские №1');

    await user.click(within(section).getByRole('button', { name: 'Женские' }));

    await within(section).findByText('Перчатки женские №1');
    expect(within(section).queryByText('Перчатки мужские №1')).not.toBeInTheDocument();
    expect(within(section).getByRole('button', { name: 'Женские' })).toHaveClass('active');
    expect(requests.at(-1)?.get('categoryId')).toBe('22');

    // В «Женских» ровно 6 товаров — кнопка остаётся, догрузка приходит пустой и убирает её
    await user.click(within(section).getByRole('button', { name: 'Загрузить ещё' }));
    await within(section).findByText('Перчатки женские №6');
    expect(requests.at(-1)?.get('categoryId')).toBe('22');
    expect(requests.at(-1)?.get('offset')).toBe('6');
  });

  it('пока грузится новая категория — лоадер, товары прошлой категории уже убраны', async () => {
    const { user } = renderRoute('/');
    const section = await catalogSection();
    await within(section).findByText('Перчатки мужские №1');

    const { gate, release } = createGate();
    server.use(
      http.get(
        '*/api/items',
        async () => {
          await gate;
          return HttpResponse.json([]);
        },
        { once: true },
      ),
    );
    await user.click(within(section).getByRole('button', { name: 'Женские' }));

    expect(
      await within(section).findByRole('status', { name: 'Загрузка каталога' }),
    ).toBeInTheDocument();
    expect(within(section).queryByText('Перчатки мужские №1')).not.toBeInTheDocument();
    release();
    expect(
      await within(section).findByText('В этой категории пока нет товаров.'),
    ).toBeInTheDocument();
  });

  it('новая категория не загрузилась — ошибка, а не старый список без предупреждения', async () => {
    const { user } = renderRoute('/');
    const section = await catalogSection();
    await within(section).findByText('Перчатки мужские №1');

    server.use(http.get('*/api/items', () => HttpResponse.error(), { once: true }));
    await user.click(within(section).getByRole('button', { name: 'Женские' }));

    expect(await within(section).findByRole('alert')).toHaveTextContent(
      'Не удалось загрузить каталог.',
    );
    expect(within(section).queryByText('Перчатки мужские №1')).not.toBeInTheDocument();
  });

  it('упала догрузка — показанные товары остаются, повторяется только следующая порция', async () => {
    const { user } = renderRoute('/');
    const section = await catalogSection();
    await within(section).findByText('Перчатки мужские №6');

    server.use(http.get('*/api/items', () => HttpResponse.error(), { once: true }));
    await user.click(within(section).getByRole('button', { name: 'Загрузить ещё' }));

    const alert = await within(section).findByRole('alert');
    expect(alert).toHaveTextContent('Не удалось загрузить следующие товары.');
    expect(alert).toHaveTextContent('Нет связи с сервером');
    expect(productTitles(section)).toHaveLength(6);

    await user.click(within(alert).getByRole('button', { name: 'Повторить' }));
    await within(section).findByText('Перчатки женские №4');
    expect(productTitles(section)).toHaveLength(12);
  });

  it('первая порция не загрузилась — ошибка вместо списка и повтор', async () => {
    server.use(http.get('*/api/items', () => HttpResponse.error(), { once: true }));
    const { user } = renderRoute('/');
    const section = await catalogSection();

    const alert = await within(section).findByRole('alert');
    expect(alert).toHaveTextContent('Не удалось загрузить каталог.');

    await user.click(within(alert).getByRole('button', { name: 'Повторить' }));
    expect(await within(section).findByText('Перчатки мужские №1')).toBeInTheDocument();
  });

  it('битая картинка товара заменяется заглушкой', async () => {
    renderRoute('/');
    const section = await catalogSection();
    const image = await within(section).findAllByRole('img', { name: 'Перчатки мужские №1' });
    const catalogImage = image.at(-1)!;

    expect(catalogImage).toHaveAttribute('src', 'https://img.test/100.jpg');
    expect(catalogImage).toHaveStyle({ aspectRatio: '1 / 1' });
    fireEvent.error(catalogImage);
    expect(catalogImage.getAttribute('src')).toMatch(/^data:image\/svg\+xml/);
  });
});

describe('Страница каталога и поиск', () => {
  it('поиск из шапки: переход в каталог, текст в поле, запрос с q', async () => {
    const requests = recordItemsRequests();
    const { user, router } = renderRoute('/about.html');

    await user.click(await screen.findByRole('button', { name: 'Открыть поиск' }));
    await user.type(screen.getByRole('searchbox', { name: 'Поиск по каталогу' }), 'женские{Enter}');

    expect(router.state.location.pathname).toBe('/catalog.html');
    const section = await catalogSection();
    expect(within(section).getByRole('searchbox', { name: 'Поиск по каталогу' })).toHaveValue(
      'женские',
    );
    await within(section).findByText('Перчатки женские №1');
    expect(requests.at(-1)?.get('q')).toBe('женские');
  });

  it('поиск срабатывает по Enter, а не на каждый символ', async () => {
    const requests = recordItemsRequests();
    const { user, router } = renderRoute('/catalog.html');
    const section = await catalogSection();
    await within(section).findByText('Перчатки мужские №1');
    const before = requests.length;

    const field = within(section).getByRole('searchbox', { name: 'Поиск по каталогу' });
    await user.type(field, 'черный');
    expect(requests).toHaveLength(before);

    await user.clear(field);
    await user.type(field, '  Чёрный  {Enter}');
    // Поиск по точному цвету: чёрная пара одна
    await waitFor(() => expect(productTitles(section)).toEqual(['Перчатки мужские №1']));
    expect(field).toHaveValue('Чёрный');
    expect(router.state.location.search).toBe('?q=%D0%A7%D1%91%D1%80%D0%BD%D1%8B%D0%B9');
  });

  it('смена категории сохраняет поиск, фильтр живёт в URL', async () => {
    const requests = recordItemsRequests();
    const { user, router } = renderRoute('/catalog.html?q=%E2%84%96');
    const section = await catalogSection();
    await within(section).findByText('Перчатки мужские №1');

    await user.click(within(section).getByRole('button', { name: 'Мужские' }));
    await within(section).findByRole('button', { name: 'Мужские', pressed: true });

    expect(router.state.location.search).toBe('?q=%E2%84%96&category=21');
    await within(section).findByText('Перчатки мужские №1');
    expect(requests.at(-1)?.get('q')).toBe('№');
    expect(requests.at(-1)?.get('categoryId')).toBe('21');
  });

  it('категория из URL применяется при открытии страницы', async () => {
    renderRoute('/catalog.html?category=22');
    const section = await catalogSection();
    expect(await within(section).findByRole('button', { name: 'Женские' })).toHaveClass('active');
    await within(section).findByText('Перчатки женские №1');
  });

  it('ничего не найдено — понятное сообщение и сброс поиска', async () => {
    const { user, router } = renderRoute('/catalog.html?q=варежки');
    const section = await catalogSection();

    expect(
      await within(section).findByText('По запросу «варежки» ничего не найдено.'),
    ).toBeInTheDocument();
    expect(
      within(section).queryByRole('button', { name: 'Загрузить ещё' }),
    ).not.toBeInTheDocument();

    await user.click(within(section).getByRole('button', { name: 'Сбросить поиск' }));
    expect(router.state.location.search).toBe('');
    expect(within(section).getByRole('searchbox', { name: 'Поиск по каталогу' })).toHaveValue('');
    await within(section).findByText('Перчатки мужские №1');
  });

  it('невалидная категория в URL не ломает страницу — «Все»', async () => {
    renderRoute('/catalog.html?category=abc');
    const section = await catalogSection();
    expect(await within(section).findByRole('button', { name: 'Все' })).toHaveClass('active');
  });
});
