import { useId, useState } from 'react';
import { Link, NavLink } from 'react-router';
import { CartWidget } from '../features/cart/CartWidget';
import { HeaderSearch } from '../features/search/HeaderSearch';
import { HEADER_NAV } from '../shared/config/navigation';
import { ROUTES } from '../shared/config/routes';
import { useStorefront } from '../storefront';

/**
 * На десктопе — как в вёрстке: логотип, меню, иконки в одну строку.
 * На телефоне (уже 576px) меню прячется за «гамбургер», а поиск и корзина
 * остаются в первой строке рядом с логотипом — они нужны чаще меню.
 * Порядок меняют order-классы Bootstrap, DOM один на все ширины.
 */
export function Header() {
  const { logo } = useStorefront();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuId = useId();
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="container">
      <div className="row">
        <div className="col">
          <nav className="navbar navbar-expand-sm navbar-light bg-light" aria-label="Основное меню">
            <Link className="navbar-brand" to={ROUTES.home} onClick={closeMenu}>
              <img src={logo.src} alt={logo.alt} width={logo.width} height={logo.height} />
            </Link>

            <div
              id={menuId}
              className={`collapse navbar-collapse order-3 order-sm-1${isMenuOpen ? ' show' : ''}`}
            >
              <ul className="navbar-nav mr-auto">
                {HEADER_NAV.map(({ to, label }) => (
                  <li className="nav-item" key={to}>
                    {/* end: «Главная» (/) не должна подсвечиваться на всех страницах */}
                    <NavLink className="nav-link" to={to} end onClick={closeMenu}>
                      {label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            <div className="header-controls order-1 order-sm-2 ml-auto">
              <HeaderSearch>
                <CartWidget />
              </HeaderSearch>
            </div>

            <button
              type="button"
              className="navbar-toggler order-2 ml-2"
              aria-controls={menuId}
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              <span className="navbar-toggler-icon" />
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
