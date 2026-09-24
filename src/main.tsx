import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import { router } from './app/router';
// Единственное место, где выбирается магазин. Другой бренд — другая строка здесь.
import { bosaNoga } from './brands/bosa-noga';
import { StorefrontProvider } from './storefront';

import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/css/style.css';
import './assets/css/overrides.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Не найден корневой элемент #root');
}

createRoot(container).render(
  <StrictMode>
    <StorefrontProvider config={bosaNoga}>
      <RouterProvider router={router} />
    </StorefrontProvider>
  </StrictMode>,
);
