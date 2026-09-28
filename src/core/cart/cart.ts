import type { Product, ProductId } from '../catalog';
import type { CartLine, CartLineChange, CartLineKey, OrderItem } from './types';

export const lineKey = ({
  productId,
  variantId,
}: Pick<CartLine, 'productId' | 'variantId'>): CartLineKey => `${productId}:${variantId}`;

/**
 * Добавляет позицию. Тот же товар и вариант — количество складывается
 * (не больше maxQuantity), цена берётся из последнего нажатия «В корзину»:
 * покупатель только что видел её на странице.
 */
export const addLine = (
  lines: readonly CartLine[],
  line: CartLine,
  maxQuantity: number,
): CartLine[] => {
  const key = lineKey(line);
  const existing = lines.find((item) => lineKey(item) === key);

  if (!existing) {
    return [...lines, { ...line, quantity: Math.min(line.quantity, maxQuantity) }];
  }

  return lines.map((item) =>
    item === existing
      ? {
          ...line,
          quantity: Math.min(existing.quantity + line.quantity, maxQuantity),
        }
      : item,
  );
};

export const removeLine = (lines: readonly CartLine[], key: CartLineKey): CartLine[] =>
  lines.filter((line) => lineKey(line) !== key);

export const lineTotal = ({ price, quantity }: CartLine): number => price * quantity;

/** Сумма считается при отображении, в хранилище не пишется (требование задания) */
export const cartTotal = (lines: readonly CartLine[]): number =>
  lines.reduce((sum, line) => sum + lineTotal(line), 0);

/** Число позиций — его показывает индикатор на иконке корзины */
export const positionsCount = (lines: readonly CartLine[]): number => lines.length;

export const toOrderItems = (lines: readonly CartLine[]): OrderItem[] =>
  lines.map(({ productId, price, quantity }) => ({ productId, price, quantity }));

export const uniqueProductIds = (lines: readonly CartLine[]): ProductId[] => [
  ...new Set(lines.map((line) => line.productId)),
];

/**
 * Сверяет корзину с актуальными товарами.
 * `fresh` — свежие карточки по id; null — товара больше нет (сервер ответил 404).
 * Пустой результат означает, что заказ можно отправлять как есть.
 */
export const reconcileCart = (
  lines: readonly CartLine[],
  fresh: ReadonlyMap<ProductId, Product | null>,
): CartLineChange[] =>
  lines.flatMap((line): CartLineChange[] => {
    const key = lineKey(line);
    if (!fresh.has(line.productId)) return [];

    const product = fresh.get(line.productId);
    if (!product) return [{ key, kind: 'removed' }];

    const variant = product.variants.find(({ id }) => id === line.variantId);
    if (!variant?.available) return [{ key, kind: 'unavailable' }];

    return product.price === line.price
      ? []
      : [{ key, kind: 'price', oldPrice: line.price, newPrice: product.price }];
  });

/** Применяет новые цены, на которые покупатель согласился */
export const applyPriceChanges = (
  lines: readonly CartLine[],
  changes: readonly CartLineChange[],
): CartLine[] => {
  const prices = new Map(
    changes.flatMap((change) => (change.kind === 'price' ? [[change.key, change.newPrice]] : [])),
  );
  return lines.map((line) => {
    const price = prices.get(lineKey(line));
    return price === undefined ? line : { ...line, price };
  });
};
