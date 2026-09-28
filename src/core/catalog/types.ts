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

/**
 * Вариант исполнения товара: у обуви и перчаток — размер, у сумки может быть цвет.
 * Что это за вариант и как его подписать, решает бренд, ядро этого не знает.
 */
export interface ProductVariant {
  /** Устойчивый идентификатор варианта внутри товара */
  id: string;
  /** Подпись для покупателя: «18 US», «M», «Бордовый» */
  label: string;
  available: boolean;
}

/** Полная карточка товара */
export interface Product extends ProductSummary {
  images: string[];
  variants: ProductVariant[];
  /**
   * Описательные характеристики «как есть»: артикул, материал, сезон…
   * Какие из них показывать и как подписывать — решает бренд (см. resolveSpecs).
   */
  attributes: Readonly<Record<string, string>>;
}
