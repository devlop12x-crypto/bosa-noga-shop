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
