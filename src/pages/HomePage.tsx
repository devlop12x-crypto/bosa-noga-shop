import { PageTitle } from '../shared/ui/PageTitle';

/** Главная: «Хиты продаж» и каталог подключаются на этапе работы с API */
export function HomePage() {
  return (
    <>
      <PageTitle />
      <section className="top-sales">
        <h2 className="text-center">Хиты продаж!</h2>
      </section>
      <section className="catalog">
        <h2 className="text-center">Каталог</h2>
      </section>
    </>
  );
}
