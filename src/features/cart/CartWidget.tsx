import { Link } from 'react-router';
import { useAppSelector } from '../../app/hooks';
import { ROUTES } from '../../shared/config/routes';
import { selectPositionsCount } from './cartSlice';

/**
 * Иконка корзины в шапке. Ссылка, а не div с программной навигацией:
 * работает с клавиатуры, открывается в новой вкладке, читается скринридером.
 * Индикатор — число позиций; пустая корзина — индикатора нет (требование задания).
 */
export function CartWidget() {
  const count = useAppSelector(selectPositionsCount);

  return (
    <Link
      to={ROUTES.cart}
      className="header-controls-pic header-controls-cart"
      aria-label={count > 0 ? `Корзина, позиций: ${count}` : 'Корзина'}
    >
      {count > 0 && (
        <div className="header-controls-cart-full" aria-hidden="true">
          {count}
        </div>
      )}
      <div className="header-controls-cart-menu" />
    </Link>
  );
}
