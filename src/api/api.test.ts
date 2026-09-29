import { describe, expect, it } from 'vitest';
import { resolveApiBaseUrl } from './config';
import { isNotFoundError } from './errors';
import { toOrderRequest, toProduct, toProductSummary } from './mappers';
import { DEFAULT_MAX_RETRIES, parseMaxRetries, shouldRetry } from './retryPolicy';

describe('resolveApiBaseUrl', () => {
  it('достраивает относительный адрес от origin', () => {
    expect(resolveApiBaseUrl('/api', 'http://localhost:5173')).toBe('http://localhost:5173/api/');
  });

  it('абсолютный адрес оставляет как есть', () => {
    expect(resolveApiBaseUrl('https://shop.test/api/', 'http://localhost')).toBe(
      'https://shop.test/api/',
    );
  });
});

describe('toProductSummary', () => {
  const dto = { id: 1, category: 13, title: 'Кеды', price: 1400, images: ['a.jpg', 'b.jpg'] };

  it('берёт первую картинку и переименовывает поля в доменные', () => {
    expect(toProductSummary(dto)).toEqual({
      id: 1,
      categoryId: 13,
      title: 'Кеды',
      price: 1400,
      image: 'a.jpg',
    });
  });

  it('товар без картинок — image: null', () => {
    expect(toProductSummary({ ...dto, images: [] }).image).toBeNull();
  });
});

describe('shouldRetry', () => {
  it.each([
    [{ status: 'FETCH_ERROR', error: '' }, 'сбой сети'],
    [{ status: 'TIMEOUT_ERROR', error: '' }, 'таймаут'],
    [{ status: 500, data: null }, '500'],
    [{ status: 503, data: null }, '503'],
  ] as const)('повторяет чтение: %o (%s)', (error, _label) => {
    expect(shouldRetry(error, 1, 'query')).toBe(true);
  });

  it.each([
    [{ status: 404, data: 'Not found' }],
    [{ status: 400, data: null }],
    [{ status: 'PARSING_ERROR', originalStatus: 200, data: '', error: '' }],
  ] as const)('не повторяет ошибки, которые не исправятся сами: %o', (error) => {
    expect(shouldRetry(error, 1, 'query')).toBe(false);
  });

  it('никогда не повторяет запись — заказ мог уже создаться', () => {
    expect(shouldRetry({ status: 'FETCH_ERROR', error: '' }, 1, 'mutation')).toBe(false);
  });

  it('останавливается после лимита попыток', () => {
    expect(shouldRetry({ status: 500, data: null }, 4, 'query', 3)).toBe(false);
  });
});

describe('parseMaxRetries', () => {
  it('берёт число из env', () => {
    expect(parseMaxRetries('0')).toBe(0);
    expect(parseMaxRetries('5')).toBe(5);
  });

  it.each([undefined, '', 'abc', '-1', '1.5'])('%s — значение по умолчанию', (raw) => {
    expect(parseMaxRetries(raw)).toBe(DEFAULT_MAX_RETRIES);
  });
});

describe('toProduct', () => {
  const dto = {
    id: 20,
    category: 13,
    title: 'Кроссовки',
    images: ['a.jpg', 'b.jpg'],
    sku: '1000000',
    manufacturer: 'Chanel',
    color: 'Черный',
    heelSize: '3 см.',
    price: 12000,
    oldPrice: 14000,
    sizes: [
      { size: '10 US', available: true },
      { size: '15 US', available: false },
    ],
  };

  it('размеры — варианты, строковые поля — атрибуты, служебные поля отброшены', () => {
    const product = toProduct(dto);
    expect(product.image).toBe('a.jpg');
    expect(product.images).toEqual(['a.jpg', 'b.jpg']);
    expect(product.variants).toEqual([
      { id: '10 US', label: '10 US', available: true },
      { id: '15 US', label: '15 US', available: false },
    ]);
    expect(product.attributes).toEqual({
      sku: '1000000',
      manufacturer: 'Chanel',
      color: 'Черный',
      heelSize: '3 см.',
    });
  });
});

describe('toOrderRequest', () => {
  it('переводит заказ в форму бэкенда', () => {
    expect(
      toOrderRequest({ phone: '+79123456789', address: 'Вологда' }, [
        { productId: 20, price: 12000, quantity: 2 },
      ]),
    ).toEqual({
      owner: { phone: '+79123456789', address: 'Вологда' },
      items: [{ id: 20, price: 12000, count: 2 }],
    });
  });
});

describe('isNotFoundError', () => {
  it('404 — и с JSON-телом, и с неразборчивым', () => {
    expect(isNotFoundError({ status: 404, data: 'Not found' })).toBe(true);
    expect(
      isNotFoundError({ status: 'PARSING_ERROR', originalStatus: 404, data: '', error: '' }),
    ).toBe(true);
  });

  it.each([undefined, null, { status: 500, data: null }, { status: 'FETCH_ERROR', error: '' }])(
    'остальное — не 404: %o',
    (error) => {
      expect(isNotFoundError(error)).toBe(false);
    },
  );
});
