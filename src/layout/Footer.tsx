import { Link } from 'react-router';
import { FOOTER_NAV } from '../shared/config/navigation';
import { useStorefront } from '../storefront';

export function Footer() {
  const { contacts, footer } = useStorefront();

  return (
    <footer className="container bg-light footer">
      <div className="row">
        {/* На телефоне колонки идут столбиком, на планшете и шире — в ряд, как в вёрстке */}
        <div className="col-12 col-md">
          <section>
            <h5>Информация</h5>
            <ul className="nav flex-column">
              {FOOTER_NAV.map(({ to, label }) => (
                <li className="nav-item" key={to}>
                  <Link to={to} className="nav-link">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <div className="col-12 col-md">
          <section>
            <h5>Принимаем к оплате:</h5>
            <div className="footer-pay">
              {footer.paymentSystems.map((name) => (
                <div key={name} className={`footer-pay-systems footer-pay-systems-${name}`} />
              ))}
            </div>
          </section>
          <section>
            <div className="footer-copyright">
              {footer.copyright}
              <br />
              {footer.note}
            </div>
          </section>
        </div>
        <div className="col-12 col-md text-md-right">
          <section className="footer-contacts">
            <h5>Контакты:</h5>
            <a className="footer-contacts-phone" href={contacts.phone.href}>
              {contacts.phone.display}
            </a>
            <span className="footer-contacts-working-hours">{contacts.workingHours}</span>
            <a className="footer-contacts-email" href={`mailto:${contacts.email}`}>
              {contacts.email}
            </a>
            <div className="footer-social-links">
              {footer.socialLinks.map((name) => (
                <div key={name} className={`footer-social-link footer-social-link-${name}`} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </footer>
  );
}
