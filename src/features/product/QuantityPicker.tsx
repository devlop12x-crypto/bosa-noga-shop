import { clampQuantity } from '../../core/catalog';

interface QuantityPickerProps {
  value: number;
  max: number;
  onChange: (value: number) => void;
}

export function QuantityPicker({ value, max, onChange }: QuantityPickerProps) {
  return (
    <p>
      Количество:{' '}
      <span className="btn-group btn-group-sm pl-2" role="group" aria-label="Количество">
        <button
          type="button"
          className="btn btn-secondary"
          aria-label="Уменьшить количество"
          disabled={value <= 1}
          onClick={() => onChange(clampQuantity(value - 1, max))}
        >
          -
        </button>
        <output className="btn btn-outline-primary" aria-live="polite">
          {value}
        </output>
        <button
          type="button"
          className="btn btn-secondary"
          aria-label="Увеличить количество"
          disabled={value >= max}
          onClick={() => onChange(clampQuantity(value + 1, max))}
        >
          +
        </button>
      </span>
    </p>
  );
}
