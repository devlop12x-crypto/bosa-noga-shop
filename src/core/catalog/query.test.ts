import { describe, expect, it } from 'vitest';
import { nextPageOffset, normalizeSearch, parseCategoryId } from './query';

describe('normalizeSearch', () => {
  it('обрезает и схлопывает пробелы', () => {
    expect(normalizeSearch('  чёрные \t  кеды ')).toBe('чёрные кеды');
    expect(normalizeSearch('   ')).toBe('');
  });
});

describe('parseCategoryId', () => {
  it('принимает положительное целое', () => {
    expect(parseCategoryId('13')).toBe(13);
  });

  it.each([null, undefined, '', '0', '-1', 'abc', '1.5'])('%s — «Все»', (raw) => {
    expect(parseCategoryId(raw)).toBeNull();
  });
});

describe('nextPageOffset', () => {
  it('полная порция — есть следующая', () => {
    expect(nextPageOffset(6, 0, 6)).toBe(6);
    expect(nextPageOffset(6, 12, 6)).toBe(18);
  });

  it('неполная или пустая порция — конец списка', () => {
    expect(nextPageOffset(5, 6, 6)).toBeUndefined();
    expect(nextPageOffset(0, 6, 6)).toBeUndefined();
  });
});
