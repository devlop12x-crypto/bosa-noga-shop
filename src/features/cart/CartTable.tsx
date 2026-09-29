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
      <table className="table table-bordered">
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
                <th scope="row">{index + 1}</th>
                <td>
                  <Link to={productPath(line.productId)}>{line.title}</Link>
                  {change && <ChangeNote change={change} format={price} />}
                </td>
                <td>{line.variantLabel}</td>
                <td>{line.quantity}</td>
                <td>{price(line.price)}</td>
                <td>{price(lineTotal(line))}</td>
                <td>
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
          <tr>
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
