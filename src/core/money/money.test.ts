import { describe, expect, it } from 'vitest';
import { formatPrice } from './index';

const rub = { locale: 'ru-RU', currencyLabel: 'руб.' };

describe('formatPrice', () => {
  it('форматирует как в вёрстке, без переносов внутри цены', () => {
    expect(formatPrice(34000, rub)).toBe('34\u00a0000\u00a0руб.');
    expect(formatPrice(1400, rub)).toBe('1\u00a0400\u00a0руб.');
  });

  it('другой магазин — другая подпись', () => {
    expect(formatPrice(2500, { locale: 'en-US', currencyLabel: 'USD' })).toBe('2,500\u00a0USD');
  });
});
