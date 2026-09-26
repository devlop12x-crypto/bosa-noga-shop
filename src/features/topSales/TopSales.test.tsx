import { screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '../../test/mocks/server';
import { renderRoute } from '../../test/renderRoute';

const topSalesSection = async () =>
  (await screen.findByRole('heading', { name: 'Хиты продаж!' })).closest('section')!;

describe('Хиты продаж', () => {
  it('показывает карточки с ценой в формате магазина и ссылкой на товар', async () => {
    renderRoute('/');
    const section = await topSalesSection();

    const card = (await within(section).findByText('Перчатки мужские №1')).closest('.card')!;
    expect(within(card as HTMLElement).getByText('1 000 ₽')).toBeInTheDocument();
    expect(within(card as HTMLElement).getByRole('link', { name: 'Заказать' })).toHaveAttribute(
      'href',
      '/catalog/100.html',
    );
  });

  it('пока грузится — свой лоадер', async () => {
    renderRoute('/');
    const section = await topSalesSection();
    expect(
      within(section).getByRole('status', { name: 'Загрузка хитов продаж' }),
    ).toBeInTheDocument();
  });

  it('пустой ответ — блок не отображается совсем, даже заголовок', async () => {
    server.use(http.get('*/api/top-sales', () => HttpResponse.json([])));
    renderRoute('/');

    // Дождались каталога — значит, хиты тоже успели ответить
    await screen.findByText('Перчатки мужские №6');
    expect(screen.queryByRole('heading', { name: 'Хиты продаж!' })).not.toBeInTheDocument();
  });

  it('ошибка сервера — сообщение в самом виджете и повтор без перезагрузки', async () => {
    server.use(
      http.get('*/api/top-sales', () => new HttpResponse(null, { status: 500 }), { once: true }),
    );
    const { user } = renderRoute('/');
    const section = await topSalesSection();

    const alert = await within(section).findByRole('alert');
    expect(alert).toHaveTextContent('Не удалось загрузить хиты продаж.');
    expect(alert).toHaveTextContent('Сервер временно недоступен.');

    // Каталог при этом работает
    expect(await screen.findByText('Перчатки мужские №6')).toBeInTheDocument();

    await user.click(within(alert).getByRole('button', { name: 'Повторить' }));
    expect(await within(section).findByText('Перчатки мужские №1')).toBeInTheDocument();
    expect(within(section).queryByRole('alert')).not.toBeInTheDocument();
  });
});
