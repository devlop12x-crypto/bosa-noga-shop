import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderRoute } from '../../test/renderRoute';

const setup = async (url = '/about.html') => {
  const view = renderRoute(url);
  const toggle = await screen.findByRole('button', { name: 'Открыть поиск' });
  const input = screen.getByRole('searchbox', { name: 'Поиск по каталогу', hidden: true });
  const form = screen.getByRole('search', { hidden: true });
  return { ...view, toggle, input, form };
};

describe('HeaderSearch', () => {
  it('по умолчанию поле скрыто', async () => {
    const { form, toggle } = await setup();
    expect(form).toHaveClass('invisible');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('первый клик раскрывает поле и ставит в него фокус', async () => {
    const { user, toggle, form, input } = await setup();
    await user.click(toggle);
    expect(form).not.toHaveClass('invisible');
    expect(input).toHaveFocus();
    expect(toggle).toHaveAccessibleName('Найти');
  });

  it('второй клик с текстом ведёт в каталог с запросом и закрывает поле', async () => {
    const { user, toggle, input, form, router } = await setup();
    await user.click(toggle);
    await user.type(input, '  жар  ');
    await user.click(toggle);

    expect(router.state.location.pathname).toBe('/catalog.html');
    expect(new URLSearchParams(router.state.location.search).get('q')).toBe('жар');
    expect(form).toHaveClass('invisible');
    expect(input).toHaveValue('');
  });

  it('второй клик без текста просто схлопывает поле', async () => {
    const { user, toggle, input, form, router } = await setup();
    await user.click(toggle);
    await user.type(input, '   ');
    await user.click(toggle);

    expect(form).toHaveClass('invisible');
    expect(router.state.location.pathname).toBe('/about.html');
  });

  it('Enter в поле работает как второй клик', async () => {
    const { user, toggle, input, router } = await setup();
    await user.click(toggle);
    await user.type(input, 'чёрный{Enter}');
    expect(router.state.location.pathname).toBe('/catalog.html');
    expect(new URLSearchParams(router.state.location.search).get('q')).toBe('чёрный');
  });

  it('Escape закрывает поле без перехода', async () => {
    const { user, toggle, input, form, router } = await setup();
    await user.click(toggle);
    await user.type(input, 'жар{Escape}');
    expect(form).toHaveClass('invisible');
    expect(router.state.location.pathname).toBe('/about.html');
  });
});
