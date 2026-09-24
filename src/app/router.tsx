import { createBrowserRouter } from 'react-router';
import { routes } from './routes';

// На GitHub Pages приложение живёт в /<имя-репозитория>/ — basename берём
// из base сборки, чтобы маршруты из задания (/catalog.html и т. д.) работали и там.
const basename = import.meta.env.BASE_URL.replace(/\/+$/, '') || '/';

export const router = createBrowserRouter(routes, { basename });
