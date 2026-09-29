import { useMemo } from 'react';
import { describeRequestError } from '../../api/errors';
import { shopApi, useGetProductsInfiniteQuery } from '../../api/shopApi';
import { useAppSelector } from '../../app/hooks';
import type { CatalogFilter } from '../../core/catalog';
import { ProductCard } from '../../entities/product/ProductCard';
import { ErrorMessage } from '../../shared/ui/ErrorMessage';
import { Preloader } from '../../shared/ui/Preloader';

interface ProductGridProps {
  filter: CatalogFilter;
  /** Есть только там, где есть поле поиска */
  onResetSearch?: () => void;
}

export function ProductGrid({ filter, onResetSearch }: ProductGridProps) {
  const {
    // currentData, а не data: data хранит ответ по ПРЕДЫДУЩЕМУ фильтру, пока новый грузится
    // или если он упал, — и старый список висел бы на экране вместо лоадера или ошибки
    currentData: data,
    error,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useGetProductsInfiniteQuery(filter);

  // Упала именно догрузка, а не первая порция. Флаг есть в селекторе эндпоинта,
  // а в тип результата хука RTK 2.12 его не вынес — берём из селектора, с полной типизацией
  const { categoryId, search } = filter;
  const selectProducts = useMemo(
    () => shopApi.endpoints.getProducts.select({ categoryId, search }),
    [categoryId, search],
  );
  const isFetchNextPageError = useAppSelector(
    (state) => selectProducts(state).isFetchNextPageError,
  );

  if (!data) {
    return isError ? (
      <ErrorMessage
        title="Не удалось загрузить каталог."
        details={describeRequestError(error)}
        onRetry={() => void refetch()}
      />
    ) : (
      <Preloader label="Загрузка каталога" />
    );
  }

  const products = data.pages.flat();

  if (products.length === 0) {
    return <EmptyResult search={filter.search} onResetSearch={onResetSearch} />;
  }

  return (
    <>
      <div className="row">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} className="catalog-item-card" />
        ))}
      </div>

      {/* Упала догрузка: уже показанные товары остаются, повторяется только следующая порция */}
      {isFetchNextPageError && (
        <ErrorMessage
          title="Не удалось загрузить следующие товары."
          details={describeRequestError(error)}
          onRetry={() => void fetchNextPage()}
        />
      )}

      {hasNextPage && !isFetchNextPageError && (
        <div className="text-center">
          {isFetchingNextPage && <Preloader label="Загрузка следующих товаров" />}
          <button
            type="button"
            className="btn btn-outline-primary"
            disabled={isFetchingNextPage}
            onClick={() => void fetchNextPage()}
          >
            Загрузить ещё
          </button>
        </div>
      )}
    </>
  );
}

interface EmptyResultProps {
  search: string;
  onResetSearch?: (() => void) | undefined;
}

function EmptyResult({ search, onResetSearch }: EmptyResultProps) {
  if (!search) {
    return <p className="text-center text-muted my-4">В этой категории пока нет товаров.</p>;
  }

  return (
    <div className="text-center my-4">
      <p className="mb-1">По запросу «{search}» ничего не найдено.</p>
      <p className="text-muted small">
        Поиск работает по части названия или по точному цвету, например «чёрный».
      </p>
      {onResetSearch && (
        <button type="button" className="btn btn-outline-primary" onClick={onResetSearch}>
          Сбросить поиск
        </button>
      )}
    </div>
  );
}
