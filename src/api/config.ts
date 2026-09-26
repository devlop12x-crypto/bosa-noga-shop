/** Сколько товаров отдаёт /api/items за раз. Контракт бэкенда, а не настройка витрины */
export const CATALOG_PAGE_SIZE = 6;

/**
 * Абсолютный базовый URL API. VITE_API_URL бывает относительным (/api в разработке),
 * а Request в Node (тесты) относительные адреса не принимает — достраиваем от origin.
 */
export const resolveApiBaseUrl = (raw: string, origin: string): string =>
  new URL(raw.endsWith('/') ? raw : `${raw}/`, origin).href;
