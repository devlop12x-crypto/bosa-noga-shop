import { Link } from 'react-router';
import { ROUTES } from '../../shared/config/routes';

/**
 * Иконка корзины в шапке. Ссылка, а не div с программной навигацией:
 * работает с клавиатуры, открывается в новой вкладке, читается скринридером.
 * Счётчик позиций подключается вместе с состоянием корзины.
 */
export function CartWidget() {
  return (
    <Link
      to={ROUTES.cart}
      className="header-controls-pic header-controls-cart"
      aria-label="Корзина"
    >
      <div className="header-controls-cart-menu" />
    </Link>
  );
}
