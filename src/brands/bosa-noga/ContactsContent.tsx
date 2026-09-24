import { contacts } from './contacts';

export function ContactsContent() {
  return (
    <>
      <p>
        Наш головной офис расположен в г.Москва, по адресу: Варшавское шоссе, д. 17, бизнес-центр W
        Plaza.
      </p>
      <h5 className="text-center">Координаты для связи:</h5>
      <p>
        Телефон: <a href={contacts.phone.href}>{contacts.phone.display}</a> (
        {contacts.workingHours.toLowerCase()})
      </p>
      <p>
        Email: <a href={`mailto:${contacts.email}`}>{contacts.email}</a>
      </p>
    </>
  );
}
