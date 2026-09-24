import type { RouteObject } from 'react-router';
import { MainLayout } from '../layout/MainLayout';
import { AboutPage } from '../pages/AboutPage';
import { CartPage } from '../pages/CartPage';
import { CatalogPage } from '../pages/CatalogPage';
import { ContactsPage } from '../pages/ContactsPage';
import { ErrorPage } from '../pages/ErrorPage';
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ProductPage } from '../pages/ProductPage';
import { ROUTES } from '../shared/config/routes';

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
          { path: ROUTES.product, element: <ProductPage /> },
          { path: ROUTES.about, element: <AboutPage /> },
          { path: ROUTES.contacts, element: <ContactsPage /> },
          { path: ROUTES.cart, element: <CartPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
];
