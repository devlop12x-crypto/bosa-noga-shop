import { describe, expect, it } from 'vitest';
import { resolveApiBaseUrl } from './config';
import { toProductSummary } from './mappers';
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
