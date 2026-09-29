import type { ProductVariant } from '../../core/catalog';

interface VariantPickerProps {
  label: string;
  variants: readonly ProductVariant[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/**
 * Выбор одного варианта (размера). По умолчанию ничего не выбрано — требование задания.
 * Невыбранные варианты с тонкой рамкой: в вёрстке они выглядят как простой текст,
 * и по нему не догадаться, что его нужно нажать.
 */
export function VariantPicker({ label, variants, selectedId, onSelect }: VariantPickerProps) {
  return (
    <p role="group" aria-label={label}>
      {label}{' '}
      {variants.map(({ id, label: variantLabel }) => {
        const isSelected = id === selectedId;
        return (
          <button
            key={id}
            type="button"
            className={`catalog-item-size${isSelected ? ' selected' : ''}`}
            aria-pressed={isSelected}
            onClick={() => onSelect(id)}
          >
            {variantLabel}
          </button>
        );
      })}
    </p>
  );
}
