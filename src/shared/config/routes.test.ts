import { describe, expect, it } from 'vitest';
import { catalogSearchPath, parseProductId, productPath } from './routes';

describe('parseProductId', () => {
  it.each([
    ['20', 20],
    ['1', 1],
  ])('принимает %s', (raw, expected) => {
    expect(parseProductId(raw)).toBe(expected);
  });

  it.each([undefined, '', 'abc', '0', '-1', '1.5', '20abc', '99999999999999999999'])(
    'отклоняет %s',
    (raw) => {
      expect(parseProductId(raw)).toBeNull();
    },
  );
});

describe('построение ссылок', () => {
  it('productPath', () => {
    expect(productPath(20)).toBe('/catalog/20.html');
  });

  it('catalogSearchPath кодирует запрос', () => {
    expect(catalogSearchPath('чёрный верх')).toBe(
      '/catalog.html?q=%D1%87%D1%91%D1%80%D0%BD%D1%8B%D0%B9+%D0%B2%D0%B5%D1%80%D1%85',
    );
  });
});
