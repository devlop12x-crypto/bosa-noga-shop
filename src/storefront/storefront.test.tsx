import { renderHook, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { bosaNoga } from '../brands/bosa-noga';
import { renderRoute } from '../test/renderRoute';
import { useStorefront } from './context';

describe('бренд задаётся только конфигурацией', () => {
  it('шапка, баннер и футер берут данные из конфигурации магазина', async () => {
    renderRoute('/');

    expect(await screen.findByRole('img', { name: 'Перчатки & Ко' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Тепло рукам!' })).toBeInTheDocument();

    const footer = screen.getByRole('contentinfo');
    expect(within(footer).getByRole('link', { name: '+7 800 000-00-00' })).toHaveAttribute(
      'href',
      'tel:+78000000000',
    );
    expect(within(footer).getByText(/Доставка по Вологде/)).toBeInTheDocument();
    expect(footer.querySelectorAll('.footer-pay-systems')).toHaveLength(2);
  });

  it('в разметке чужого магазина нет ни следа Bosa Noga', async () => {
    const { container } = renderRoute('/about.html');
    await screen.findByText('Шьём перчатки с 1998 года.');

    expect(container.textContent).not.toMatch(/bosa|обув/i);
    expect(document.title).toBe('О магазине — Перчатки & Ко');
  });

  it('контент информационных страниц приходит из бренда, заголовки — общие', async () => {
    renderRoute('/contacts.html');
    expect(await screen.findByRole('heading', { level: 2, name: 'Контакты' })).toBeInTheDocument();
    expect(screen.getByText('Мастерская в центре города.')).toBeInTheDocument();
  });

  it('пакет Bosa Noga собирается и отрисовывается', async () => {
    renderRoute('/contacts.html', { storefront: bosaNoga });
    expect(await screen.findByRole('heading', { name: 'К весне готовы!' })).toBeInTheDocument();
    expect(document.title).toBe('Контакты — Bosa Noga');
    expect(screen.getByText(/Варшавское шоссе/)).toBeInTheDocument();
  });

  it('useStorefront вне провайдера падает с понятной ошибкой', () => {
    // React дублирует брошенную при рендере ошибку в console.error — в выводе тестов она не нужна
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useStorefront())).toThrow(/StorefrontProvider/);
    consoleError.mockRestore();
  });
});
