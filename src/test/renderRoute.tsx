import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { routes } from '../app/routes';
import { makeStore } from '../app/store';
import { StorefrontProvider } from '../storefront';
import type { StorefrontConfig } from '../storefront';
import { glovesStorefront } from './testStorefront';

interface RenderRouteOptions {
  storefront?: StorefrontConfig;
}

/** Рендерит приложение целиком (стор, бренд, настоящие маршруты) на указанном URL */
export function renderRoute(
  url: string,
  { storefront = glovesStorefront }: RenderRouteOptions = {},
) {
  const router = createMemoryRouter(routes, { initialEntries: [url] });
  const store = makeStore();
  const user = userEvent.setup();
  const view = render(
    <Provider store={store}>
      <StorefrontProvider config={storefront}>
        <RouterProvider router={router} />
      </StorefrontProvider>
    </Provider>,
  );
  return { ...view, router, store, user };
}
