import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderRoute } from '../test/renderRoute';

const pageHeading = (name: string) => screen.findByRole('heading', { level: 2, name });

describe('маршрутизация', () => {
  it.each([
    ['/about.html', 'О магазине'],
    ['/contacts.html', 'Контакты'],
    ['/catalog.html', 'Каталог'],
    ['/cart.html', 'Корзина'],
  ])('%s открывает страницу «%s»', async (url, heading) => {
    renderRoute(url);
    expect(await pageHeading(heading)).toBeInTheDocument();
  });

  it('несуществующий URL показывает 404 внутри общего layout', async () => {
    renderRoute('/no-such-page');
    expect(await pageHeading('Страница не найдена')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('/catalog/:id.html с нечисловым id — 404', async () => {
    renderRoute('/catalog/abc.html');
    expect(await pageHeading('Страница не найдена')).toBeInTheDocument();
  });

  it('/catalog/20.html открывает страницу товара, а не 404', async () => {
    renderRoute('/catalog/20.html');
    expect(await screen.findByRole('banner')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Страница не найдена' })).not.toBeInTheDocument();
  });

  it('подсвечивает текущий пункт меню и только его', async () => {
    renderRoute('/about.html');
    const menu = await screen.findByRole('navigation', { name: 'Основное меню' });
    expect(within(menu).getByRole('link', { name: 'О магазине' })).toHaveClass('active');
    expect(within(menu).getByRole('link', { name: 'Главная' })).not.toHaveClass('active');
  });

  it('иконка корзины ведёт на /cart.html', async () => {
    const { user, router } = renderRoute('/');
    await user.click(await screen.findByRole('link', { name: 'Корзина' }));
    expect(router.state.location.pathname).toBe('/cart.html');
  });

  it('«гамбургер» открывает меню и закрывает его после перехода', async () => {
    const { user, router } = renderRoute('/');
    const toggler = await screen.findByRole('button', { name: 'Открыть меню' });
    const menu = document.getElementById(toggler.getAttribute('aria-controls')!)!;

    expect(menu).not.toHaveClass('show');
    await user.click(toggler);
    expect(menu).toHaveClass('show');
    expect(toggler).toHaveAttribute('aria-expanded', 'true');
    expect(toggler).toHaveAccessibleName('Закрыть меню');

    await user.click(within(menu).getByRole('link', { name: 'Контакты' }));
    expect(router.state.location.pathname).toBe('/contacts.html');
    expect(menu).not.toHaveClass('show');
    expect(toggler).toHaveAttribute('aria-expanded', 'false');
  });
});
