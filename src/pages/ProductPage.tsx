import { useParams } from 'react-router';
import { describeRequestError, isNotFoundError } from '../api/errors';
import { useGetProductQuery } from '../api/shopApi';
import { ProductDetails } from '../features/product/ProductDetails';
import { parseProductId } from '../shared/config/routes';
import { ErrorMessage } from '../shared/ui/ErrorMessage';
import { PageTitle } from '../shared/ui/PageTitle';
import { Preloader } from '../shared/ui/Preloader';
import { NotFoundPage } from './NotFoundPage';

export function ProductPage() {
  const id = parseProductId(useParams().id);
  if (id === null) return <NotFoundPage />;

  // key: при переходе на другой товар выбранный размер и количество сбрасываются
  return <ProductLoader key={id} id={id} />;
}

function ProductLoader({ id }: { id: number }) {
  const { data: product, error, isError, refetch } = useGetProductQuery(id);

  if (product) {
    return (
      <>
        <PageTitle>{product.title}</PageTitle>
        <ProductDetails product={product} />
      </>
    );
  }

  if (isNotFoundError(error)) {
    return (
      <section className="top-sales">
        <PageTitle>Товар не найден</PageTitle>
        <h2 className="text-center">Товар не найден</h2>
        <p className="text-center">Возможно, он снят с продажи. Загляните в каталог.</p>
      </section>
    );
  }

  return (
    <section className="catalog-item">
      <PageTitle>Товар</PageTitle>
      {isError ? (
        <ErrorMessage
          title="Не удалось загрузить товар."
          details={describeRequestError(error)}
          onRetry={() => void refetch()}
        />
      ) : (
        <Preloader label="Загрузка товара" />
      )}
    </section>
  );
}
