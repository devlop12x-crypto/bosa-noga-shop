import { Link } from 'react-router';
import type { CartLine, CartLineChange, CartLineKey } from '../../core/cart';
import { cartTotal, lineKey, lineTotal } from '../../core/cart';
import { formatPrice } from '../../core/money';
import { productPath } from '../../shared/config/routes';
import { useStorefront } from '../../storefront';

interface CartTableProps {
  lines: readonly CartLine[];
  changes: readonly CartLineChange[];
  disabled: boolean;
  onRemove: (key: CartLineKey) => void;
}

export function CartTable({ lines, changes, disabled, onRemove }: CartTableProps) {
  const { money, product } = useStorefront();
  const price = (amount: number) => formatPrice(amount, money);
  const changeByKey = new Map(changes.map((change) => [change.key, change]));

  return (
    <div className="table-responsive">
      <table className="table table-bordered cart-table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Название</th>
            <th scope="col">{product.variantColumnTitle}</th>
            <th scope="col">Кол-во</th>
            <th scope="col">Стоимость</th>
            <th scope="col">Итого</th>
            <th scope="col">Действия</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line, index) => {
            const key = lineKey(line);
            const change = changeByKey.get(key);
            return (
              <tr key={key} className={change ? 'table-warning' : undefined}>
                <th scope="row" className="cart-table-index">
                  {index + 1}
                </th>
                <td className="cart-table-title">
                  <Link to={productPath(line.productId)}>{line.title}</Link>
                  {change && <ChangeNote change={change} format={price} />}
                </td>
                {/* data-label — подписи для узкого экрана, где таблица превращается в карточки */}
                <td data-label={product.variantColumnTitle}>{line.variantLabel}</td>
                <td data-label="Кол-во">{line.quantity}</td>
                <td data-label="Стоимость">{price(line.price)}</td>
                <td data-label="Итого">{price(lineTotal(line))}</td>
                <td className="cart-table-actions">
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    disabled={disabled}
                    aria-label={`Удалить «${line.title}», ${line.variantLabel}`}
                    onClick={() => onRemove(key)}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            );
          })}
          <tr className="cart-table-total">
            <td colSpan={5} className="text-right">
              Общая стоимость
            </td>
            <td>{price(cartTotal(lines))}</td>
            <td />
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function ChangeNote({ change, format }: { change: CartLineChange; format: (n: number) => string }) {
  switch (change.kind) {
    case 'price':
      return (
        <div className="small text-danger">
          Цена изменилась: было {format(change.oldPrice)}, стало {format(change.newPrice)}
        </div>
      );
    case 'unavailable':
      return <div className="small text-danger">Больше нет в наличии — удалите позицию</div>;
    case 'removed':
      return <div className="small text-danger">Товар снят с продажи — удалите позицию</div>;
  }
}
