/**
 * Доменные типы каталога. Ничего не знают ни о форме ответа бэкенда,
 * ни о том, что продаётся: обувь, перчатки или сумки.
 */

export type CategoryId = number;
export type ProductId = number;

export interface Category {
  id: CategoryId;
  title: string;
}

/** Товар в списке: карточка каталога и «Хиты продаж» */
export interface ProductSummary {
  id: ProductId;
  categoryId: CategoryId;
  title: string;
  /** Цена в минимальных целых единицах валюты магазина */
  price: number;
  /** Главное изображение. Товар без картинок — нормальный случай, а не ошибка */
  image: string | null;
}
