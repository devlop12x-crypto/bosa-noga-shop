import { describe, expect, it } from 'vitest';
import type { Product } from '../catalog';
import {
  addLine,
  applyPriceChanges,
  cartTotal,
  lineKey,
  positionsCount,
  reconcileCart,
  removeLine,
  toOrderItems,
  uniqueProductIds,
} from './cart';
import type { CartLine } from './types';

const line = (patch: Partial<CartLine> = {}): CartLine => ({
  productId: 1,
  variantId: 'M',
  variantLabel: 'M',
  title: 'Перчатки',
  price: 1000,
  quantity: 1,
  ...patch,
});

const product = (patch: Partial<Product> = {}): Product => ({
  id: 1,
  categoryId: 21,
  title: 'Перчатки',
  price: 1000,
  image: null,
  images: [],
  variants: [
    { id: 'M', label: 'M', available: true },
    { id: 'L', label: 'L', available: false },
  ],
  attributes: {},
  ...patch,
});

describe('addLine', () => {
  it('новая пара «товар + вариант» — новая позиция', () => {
    const lines = addLine([line()], line({ variantId: 'L', variantLabel: 'L' }), 10);
    expect(lines).toHaveLength(2);
  });

  it('та же пара — одна позиция, количество складывается', () => {
    const lines = addLine([line({ quantity: 2 })], line({ quantity: 3 }), 10);
    expect(lines).toHaveLength(1);
    expect(lines[0]?.quantity).toBe(5);
  });

  it('количество не превышает лимит', () => {
    expect(addLine([line({ quantity: 8 })], line({ quantity: 5 }), 10)[0]?.quantity).toBe(10);
    expect(addLine([], line({ quantity: 15 }), 10)[0]?.quantity).toBe(10);
  });

  it('при повторном добавлении цена — из последнего нажатия', () => {
    expect(addLine([line({ price: 1000 })], line({ price: 1200 }), 10)[0]?.price).toBe(1200);
  });

  it('не мутирует исходный массив', () => {
    const lines = Object.freeze([line()]);
    expect(() => addLine(lines, line(), 10)).not.toThrow();
  });
});

describe('итоги и заказ', () => {
  const lines = [line({ quantity: 2 }), line({ productId: 2, price: 500, quantity: 3 })];

  it('сумма и число позиций', () => {
    expect(cartTotal(lines)).toBe(3500);
    expect(positionsCount(lines)).toBe(2);
    expect(cartTotal([])).toBe(0);
  });

  it('удаление по ключу', () => {
    expect(removeLine(lines, '1:M')).toEqual([lines[1]]);
  });

  it('позиции для заказа — с зафиксированной ценой', () => {
    expect(toOrderItems(lines)).toEqual([
      { productId: 1, price: 1000, quantity: 2 },
      { productId: 2, price: 500, quantity: 3 },
    ]);
  });

  it('уникальные товары для сверки', () => {
    expect(uniqueProductIds([line(), line({ variantId: 'L' }), line({ productId: 2 })])).toEqual([
      1, 2,
    ]);
  });
});

describe('reconcileCart', () => {
  it('всё совпадает — изменений нет', () => {
    expect(reconcileCart([line()], new Map([[1, product()]]))).toEqual([]);
  });

  it('цена изменилась — старая и новая', () => {
    expect(reconcileCart([line()], new Map([[1, product({ price: 1300 })]]))).toEqual([
      { key: '1:M', kind: 'price', oldPrice: 1000, newPrice: 1300 },
    ]);
  });

  it('вариант закончился', () => {
    expect(reconcileCart([line({ variantId: 'L' })], new Map([[1, product()]]))).toEqual([
      { key: '1:L', kind: 'unavailable' },
    ]);
  });

  it('варианта больше нет в карточке — тоже «нет в наличии»', () => {
    expect(reconcileCart([line({ variantId: 'XS' })], new Map([[1, product()]]))).toEqual([
      { key: '1:XS', kind: 'unavailable' },
    ]);
  });

  it('товар снят с продажи', () => {
    expect(reconcileCart([line()], new Map([[1, null]]))).toEqual([
      { key: '1:M', kind: 'removed' },
    ]);
  });

  it('товар без свежих данных не считается изменённым', () => {
    expect(reconcileCart([line()], new Map())).toEqual([]);
  });
});

describe('applyPriceChanges', () => {
  it('обновляет только позиции с изменённой ценой', () => {
    const lines = [line(), line({ productId: 2 })];
    const result = applyPriceChanges(lines, [
      { key: lineKey(lines[0]!), kind: 'price', oldPrice: 1000, newPrice: 1300 },
      { key: '2:M', kind: 'unavailable' },
    ]);
    expect(result.map((item) => item.price)).toEqual([1300, 1000]);
    expect(result[1]).toBe(lines[1]);
  });
});
