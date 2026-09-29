import { fireEvent, screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { server } from '../../test/mocks/server';
import { renderRoute } from '../../test/renderRoute';

const setOnline = (online: boolean) => {
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(online);
  fireEvent(window, new Event(online ? 'online' : 'offline'));
};

const bannerText = /Нет соединения с интернетом/;

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Нет сети', () => {
  it('плашка появляется при потере сети и исчезает, когда сеть вернулась', async () => {
    renderRoute('/about.html');
    await screen.findByRole('heading', { level: 2, name: 'О магазине' });
    expect(screen.queryByText(bannerText)).not.toBeInTheDocument();

    setOnline(false);
    expect(screen.getByText(bannerText)).toBeInTheDocument();

    setOnline(true);
    expect(screen.queryByText(bannerText)).not.toBeInTheDocument();
  });

  it('вернулась сеть — упавший запрос повторяется сам, без нажатия «Повторить»', async () => {
    server.use(http.get('*/api/items', () => HttpResponse.error(), { once: true }));
    renderRoute('/');
    const catalog = (await screen.findByRole('heading', { level: 2, name: 'Каталог' })).closest(
      'section',
    )!;

    setOnline(false);
    expect(await within(catalog).findByRole('alert')).toHaveTextContent(
      'Не удалось загрузить каталог.',
    );

    setOnline(true);
    expect(await within(catalog).findByText('Перчатки мужские №1')).toBeInTheDocument();
    expect(within(catalog).queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByText(bannerText)).not.toBeInTheDocument();
  });
});
