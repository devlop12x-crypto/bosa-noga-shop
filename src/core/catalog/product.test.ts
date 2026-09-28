import { describe, expect, it } from 'vitest';
import { availableVariants, clampQuantity, resolveSpecs } from './product';

describe('resolveSpecs', () => {
  it('порядок и подписи — из описания бренда, отсутствующее поле — пустое', () => {
    expect(
      resolveSpecs({ sku: '100', color: 'Чёрный', extra: 'x' }, [
        { key: 'sku', label: 'Артикул' },
        { key: 'material', label: 'Материал' },
        { key: 'color', label: 'Цвет' },
      ]),
    ).toEqual([
      { label: 'Артикул', value: '100' },
      { label: 'Материал', value: '' },
      { label: 'Цвет', value: 'Чёрный' },
    ]);
  });
});

describe('availableVariants', () => {
  it('только доступные', () => {
    expect(
      availableVariants({
        variants: [
          { id: 'M', label: 'M', available: true },
          { id: 'L', label: 'L', available: false },
        ],
      }).map(({ id }) => id),
    ).toEqual(['M']);
  });
});

describe('clampQuantity', () => {
  it.each([
    [0, 1],
    [1, 1],
    [5, 5],
    [11, 10],
    [3.7, 3],
  ])('%s → %s', (value, expected) => {
    expect(clampQuantity(value, 10)).toBe(expected);
  });
});
