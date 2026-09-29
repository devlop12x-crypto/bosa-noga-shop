import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { routes } from '../app/routes';
import { makeStore } from '../app/store';
import type { CartLine } from '../core/cart';
import { createMemoryCartStorage } from '../features/cart/storage';
import { StorefrontProvider } from '../storefront';
import type { StorefrontConfig } from '../storefront';
import { registerCleanup } from './cleanup';
import { glovesStorefront } from './testStorefront';

interface RenderRouteOptions {
  storefront?: StorefrontConfig;
  /** Что лежит в корзине на момент открытия страницы */
  cart?: CartLine[];
}

/** Рендерит приложение целиком (стор, бренд, настоящие маршруты) на указанном URL */
export function renderRoute(
  url: string,
  { storefront = glovesStorefront, cart = [] }: RenderRouteOptions = {},
) {
  const router = createMemoryRouter(routes, { initialEntries: [url] });
  const cartStorage = createMemoryCartStorage(cart);
  const store = makeStore({ cartStorage });
  registerCleanup(store.dispose);
  const user = userEvent.setup();
  const view = render(
    <Provider store={store}>
      <StorefrontProvider config={storefront}>
        <RouterProvider router={router} />
      </StorefrontProvider>
    </Provider>,
  );
  return { ...view, router, store, cartStorage, user };
}
