import { Link, NavLink } from 'react-router';
import { CartWidget } from '../features/cart/CartWidget';
import { HeaderSearch } from '../features/search/HeaderSearch';
import { HEADER_NAV } from '../shared/config/navigation';
import { ROUTES } from '../shared/config/routes';
import { useStorefront } from '../storefront';

export function Header() {
  const { logo } = useStorefront();

  return (
    <header className="container">
      <div className="row">
        <div className="col">
          <nav className="navbar navbar-expand-sm navbar-light bg-light" aria-label="Основное меню">
            <Link className="navbar-brand" to={ROUTES.home}>
              <img src={logo.src} alt={logo.alt} width={logo.width} height={logo.height} />
            </Link>
            <div className="navbar-collapse">
              <ul className="navbar-nav mr-auto">
                {HEADER_NAV.map(({ to, label }) => (
                  <li className="nav-item" key={to}>
                    {/* end: «Главная» (/) не должна подсвечиваться на всех страницах */}
                    <NavLink className="nav-link" to={to} end>
                      {label}
                    </NavLink>
                  </li>
                ))}
              </ul>
              <HeaderSearch>
                <CartWidget />
              </HeaderSearch>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
