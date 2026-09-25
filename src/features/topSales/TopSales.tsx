import { describeRequestError } from '../../api/errors';
import { useGetTopSalesQuery } from '../../api/shopApi';
import { ProductCard } from '../../entities/product/ProductCard';
import { ErrorMessage } from '../../shared/ui/ErrorMessage';
import { Preloader } from '../../shared/ui/Preloader';

export function TopSales() {
  const { data, isError, error, refetch } = useGetTopSalesQuery();

  // Хитов нет — блока нет вовсе, даже заголовка (требование задания)
  if (data?.length === 0) return null;

  let content;
  if (data) {
    content = (
      <div className="row">
        {data.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  } else if (isError) {
    content = (
      <ErrorMessage
        title="Не удалось загрузить хиты продаж."
        details={describeRequestError(error)}
        onRetry={() => void refetch()}
      />
    );
  } else {
    content = <Preloader label="Загрузка хитов продаж" />;
  }

  return (
    <section className="top-sales">
      <h2 className="text-center">Хиты продаж!</h2>
      {content}
    </section>
  );
}
