import { useParams } from 'react-router';
import { parseProductId } from '../shared/config/routes';
import { PageTitle } from '../shared/ui/PageTitle';
import { NotFoundPage } from './NotFoundPage';

/** Карточка товара: загрузка по id подключается на этапе работы с API */
export function ProductPage() {
  const id = parseProductId(useParams().id);

  if (id === null) return <NotFoundPage />;

  return (
    <section className="catalog-item">
      <PageTitle>Товар</PageTitle>
    </section>
  );
}
