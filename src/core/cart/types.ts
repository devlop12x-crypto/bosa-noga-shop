import type { ProductId } from '../catalog';

/** Позиция корзины: пара «товар + вариант» */
export interface CartLine {
  productId: ProductId;
  variantId: string;
  /** Подписи сохраняются, чтобы корзина рисовалась без запросов к серверу */
  variantLabel: string;
  title: string;
  /** Цена за единицу на момент нажатия «В корзину» (требование задания) */
  price: number;
  quantity: number;
}

/** Ключ позиции. Тот же товар в другом размере — другая позиция */
export type CartLineKey = `${ProductId}:${string}`;

/**
 * Что изменилось в позиции с момента добавления в корзину.
 * - price — цена стала другой;
 * - unavailable — выбранный вариант закончился;
 * - removed — товара больше нет в магазине (404).
 */
export type CartLineChange =
  | { key: CartLineKey; kind: 'price'; oldPrice: number; newPrice: number }
  | { key: CartLineKey; kind: 'unavailable' }
  | { key: CartLineKey; kind: 'removed' };

/** Позиция в том виде, в каком её ждёт заказ */
export interface OrderItem {
  productId: ProductId;
  price: number;
  quantity: number;
}
