import { PageTitle } from '../shared/ui/PageTitle';
import { useStorefront } from '../storefront';

export function ContactsPage() {
  const { Contacts } = useStorefront().pages;

  return (
    <section className="top-sales">
      <PageTitle>Контакты</PageTitle>
      <h2 className="text-center">Контакты</h2>
      <Contacts />
    </section>
  );
}
