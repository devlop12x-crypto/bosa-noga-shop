/**
 * Форма ответов бэкенда диплома. Живёт только в слое api:
 * дальше мапперов эти типы не уходят.
 */

export interface CategoryDto {
  id: number;
  title: string;
}

/** Краткая карточка: /api/top-sales и /api/items */
export interface ItemShortDto {
  id: number;
  category: number;
  title: string;
  price: number;
  images: string[];
}

/** Полная карточка: /api/items/:id */
export interface ItemFullDto extends ItemShortDto {
  sizes: { size: string; available: boolean }[];
  oldPrice?: number;
  sku?: string;
  manufacturer?: string;
  color?: string;
  material?: string;
  reason?: string;
  season?: string;
  heelSize?: string;
}

/** Тело POST /api/order */
export interface OrderRequestDto {
  owner: { phone: string; address: string };
  items: { id: number; price: number; count: number }[];
}
