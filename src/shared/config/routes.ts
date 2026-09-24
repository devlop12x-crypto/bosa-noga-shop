/** URL страниц — заданы в условиях диплома, менять нельзя */
export const ROUTES = {
  home: '/',
  catalog: '/catalog.html',
  about: '/about.html',
  contacts: '/contacts.html',
  cart: '/cart.html',
  product: '/catalog/:id.html',
} as const;

export const productPath = (id: number): string => `/catalog/${id}.html`;

/** Ссылка на каталог с поисковым запросом: `/catalog.html?q=...` */
export const catalogSearchPath = (query: string): string =>
  `${ROUTES.catalog}?${new URLSearchParams({ q: query }).toString()}`;

/**
 * Разбирает параметр `:id` из `/catalog/:id.html`.
 * Роутер пропустит и `/catalog/abc.html`, поэтому id проверяется здесь:
 * только положительное целое, иначе `null` (показываем 404, запрос не шлём).
 */
export const parseProductId = (raw: string | undefined): number | null => {
  if (!raw || !/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};
