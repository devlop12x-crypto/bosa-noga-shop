import { describe, expect, it, vi } from 'vitest';
import { makeStore } from '../../app/store';
import type { CartLine } from '../../core/cart';
import { selectCartLines } from './cartSlice';
import { createLocalCartStorage, parseStoredCart, serializeCart } from './storage';

const line: CartLine = {
  productId: 1,
  variantId: 'M',
  variantLabel: 'M',
  title: 'Перчатки',
  price: 1000,
  quantity: 1,
};

describe('parseStoredCart', () => {
  it('восстанавливает сохранённую корзину', () => {
    expect(parseStoredCart(serializeCart([line]))).toEqual([line]);
  });

  it.each([null, '', '{битый json', '[]', '{"version":2,"lines":[]}', '{"lines":[]}'])(
    'мусор или чужой формат — пустая корзина: %s',
    (raw) => {
      expect(parseStoredCart(raw)).toEqual([]);
    },
  );

  it('битая позиция отбрасывается, остальные остаются', () => {
    const raw = JSON.stringify({
      version: 1,
      lines: [line, { ...line, price: -5 }, { ...line, quantity: 'много' }, 42],
    });
    expect(parseStoredCart(raw)).toEqual([line]);
  });
});

describe('createLocalCartStorage', () => {
  it('сохраняет и читает; пустая корзина — ключ удаляется', () => {
    const storage = createLocalCartStorage(window.localStorage, 'test/cart');
    storage.save([line]);
    expect(storage.load()).toEqual([line]);

    storage.save([]);
    expect(window.localStorage.getItem('test/cart')).toBeNull();
  });

  it('переполненное или запрещённое хранилище не ломает покупку', () => {
    const broken = {
      getItem: () => {
        throw new Error('SecurityError');
      },
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
      removeItem: vi.fn(),
    } as unknown as Storage;
    const storage = createLocalCartStorage(broken, 'test/cart');

    expect(storage.load()).toEqual([]);
    expect(() => storage.save([line])).not.toThrow();
  });

  it('изменение в другой вкладке попадает в стор', () => {
    const cartStorage = createLocalCartStorage(window.localStorage, 'sync/cart');
    const store = makeStore({ cartStorage });

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'sync/cart',
        newValue: serializeCart([line]),
        storageArea: window.localStorage,
      }),
    );
    expect(selectCartLines(store.getState())).toEqual([line]);

    // Чужой ключ игнорируется
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'other/cart',
        newValue: serializeCart([]),
        storageArea: window.localStorage,
      }),
    );
    expect(selectCartLines(store.getState())).toEqual([line]);
  });
});
