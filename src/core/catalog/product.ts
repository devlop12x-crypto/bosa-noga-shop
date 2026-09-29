import type { Product, ProductVariant } from './types';

/** Описание строки таблицы характеристик: ключ атрибута и подпись */
export interface SpecDefinition {
  key: string;
  label: string;
}

export interface SpecRow {
  label: string;
  /** Пустая строка, если у товара нет такого атрибута — по заданию поле остаётся пустым */
  value: string;
}

/** Строки таблицы характеристик в порядке, заданном брендом */
export const resolveSpecs = (
  attributes: Product['attributes'],
  definitions: readonly SpecDefinition[],
): SpecRow[] => definitions.map(({ key, label }) => ({ label, value: attributes[key] ?? '' }));

/** Варианты, которые можно купить прямо сейчас */
export const availableVariants = (product: Pick<Product, 'variants'>): ProductVariant[] =>
  product.variants.filter((variant) => variant.available);

/** Количество в пределах [1, max]: кнопки «−»/«+» не выводят его за границы */
export const clampQuantity = (value: number, max: number): number =>
  Math.min(Math.max(Math.trunc(value), 1), max);
