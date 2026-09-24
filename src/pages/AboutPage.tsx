import { PageTitle } from '../shared/ui/PageTitle';
import { useStorefront } from '../storefront';

export function AboutPage() {
  const { About } = useStorefront().pages;

  return (
    <section className="top-sales">
      <PageTitle>О магазине</PageTitle>
      <h2 className="text-center">О магазине</h2>
      <About />
    </section>
  );
}
