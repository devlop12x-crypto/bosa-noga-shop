import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { routes } from '../app/routes';
import { StorefrontProvider } from '../storefront';
import type { StorefrontConfig } from '../storefront';
import { glovesStorefront } from './testStorefront';

interface RenderRouteOptions {
  storefront?: StorefrontConfig;
}

/** Рендерит приложение с настоящей таблицей маршрутов на указанном URL */
export function renderRoute(
  url: string,
  { storefront = glovesStorefront }: RenderRouteOptions = {},
) {
  const router = createMemoryRouter(routes, { initialEntries: [url] });
  const user = userEvent.setup();
  const view = render(
    <StorefrontProvider config={storefront}>
      <RouterProvider router={router} />
    </StorefrontProvider>,
  );
  return { ...view, router, user };
}
