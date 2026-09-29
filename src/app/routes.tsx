import { lazy, Suspense } from 'react';
import type { ReactNode } from 'react';
import type { RouteObject } from 'react-router';
import { MainLayout } from '../layout/MainLayout';
import { AboutPage } from '../pages/AboutPage';
import { CatalogPage } from '../pages/CatalogPage';
import { ContactsPage } from '../pages/ContactsPage';
import { ErrorPage } from '../pages/ErrorPage';
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ROUTES } from '../shared/config/routes';
import { Preloader } from '../shared/ui/Preloader';

/*
 * Страницы товара и корзины — отдельные чанки: на главную и в каталог приходят
 * чаще всего, и код оформления заказа там не нужен. Грузятся при первом переходе.
 */
const ProductPage = lazy(() =>
  import('../pages/ProductPage').then((module) => ({ default: module.ProductPage })),
);
const CartPage = lazy(() =>
  import('../pages/CartPage').then((module) => ({ default: module.CartPage })),
);

/** Лоадер внутри layout: шапка и футер остаются, пока догружается код страницы */
const lazyPage = (page: ReactNode) => (
  <Suspense fallback={<Preloader label="Загрузка страницы" />}>{page}</Suspense>
);

/** Таблица маршрутов отдельно от роутера — тесты собирают на ней memory router */
export const routes: RouteObject[] = [
  {
    element: <MainLayout />,
    // Последний рубеж: если упал сам layout
    errorElement: <ErrorPage />,
    children: [
      {
        errorElement: <ErrorPage />,
        children: [
          { index: true, element: <HomePage /> },
          { path: ROUTES.catalog, element: <CatalogPage /> },
          { path: ROUTES.product, element: lazyPage(<ProductPage />) },
          { path: ROUTES.about, element: <AboutPage /> },
          { path: ROUTES.contacts, element: <ContactsPage /> },
          { path: ROUTES.cart, element: lazyPage(<CartPage />) },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
];
