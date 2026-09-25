import type { CategoryId } from './types';

/** Фильтр каталога: категория (null — «Все») и поисковая строка */
export interface CatalogFilter {
  categoryId: CategoryId | null;
  search: string;
}

/** Схлопывает пробелы: «  чёрные   кеды » и «чёрные кеды» — один и тот же запрос */
export const normalizeSearch = (raw: string): string => raw.trim().replace(/\s+/g, ' ');

/**
 * Разбирает id категории из строки (URL). Всё, что не положительное целое, — «Все».
 * Невалидная категория в адресе не должна ломать страницу.
 */
export const parseCategoryId = (raw: string | null | undefined): CategoryId | null => {
  if (!raw || !/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

/**
 * Смещение следующей порции или undefined, если порций больше нет.
 * Порция короче полной (в том числе пустая) означает конец списка.
 */
export const nextPageOffset = (
  lastPageSize: number,
  lastOffset: number,
  pageSize: number,
): number | undefined => (lastPageSize < pageSize ? undefined : lastOffset + pageSize);
