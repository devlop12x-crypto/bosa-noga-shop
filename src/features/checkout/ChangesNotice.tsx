import type { CartLineChange } from '../../core/cart';

interface ChangesNoticeProps {
  changes: readonly CartLineChange[];
  onAcceptPrices: () => void;
}

/** Что мешает оформить заказ и как это исправить */
export function ChangesNotice({ changes, onAcceptPrices }: ChangesNoticeProps) {
  const priceChanges = changes.filter((change) => change.kind === 'price').length;
  const unavailable = changes.length - priceChanges;

  return (
    <div className="alert alert-warning" role="alert">
      {priceChanges > 0 && (
        <p className="mb-2">
          С момента добавления в корзину изменились цены. Новая сумма — в таблице выше.{' '}
          <button type="button" className="btn btn-sm btn-warning ml-1" onClick={onAcceptPrices}>
            Принять новые цены
          </button>
        </p>
      )}
      {unavailable > 0 && (
        <p className="mb-0">
          Некоторых товаров больше нет в наличии. Удалите их, чтобы оформить заказ.
        </p>
      )}
    </div>
  );
}
