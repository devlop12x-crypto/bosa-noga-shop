import { ROUTES } from './routes';

export interface NavItem {
  to: string;
  label: string;
}

/** Меню шапки — порядок как в вёрстке */
export const HEADER_NAV: readonly NavItem[] = [
  { to: ROUTES.home, label: 'Главная' },
  { to: ROUTES.catalog, label: 'Каталог' },
  { to: ROUTES.about, label: 'О магазине' },
  { to: ROUTES.contacts, label: 'Контакты' },
];

/** Меню футера — в вёрстке другой порядок и нет «Главной» */
export const FOOTER_NAV: readonly NavItem[] = [
  { to: ROUTES.about, label: 'О магазине' },
  { to: ROUTES.catalog, label: 'Каталог' },
  { to: ROUTES.contacts, label: 'Контакты' },
];
