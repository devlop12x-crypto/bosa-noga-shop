import { describeRequestError } from '../../api/errors';
import { useGetCategoriesQuery } from '../../api/shopApi';
import type { CategoryId } from '../../core/catalog';
import { ErrorMessage } from '../../shared/ui/ErrorMessage';

interface CategoriesNavProps {
  activeId: CategoryId | null;
  onSelect: (id: CategoryId | null) => void;
}

/** Категории + «Все» (сервер его не присылает). null — это «Все» */
export function CategoriesNav({ activeId, onSelect }: CategoriesNavProps) {
  const { data: categories, isError, error, refetch } = useGetCategoriesQuery();

  if (!categories) {
    // Пока категории грузятся, свой лоадер не нужен — рядом крутится лоадер товаров
    return isError ? (
      <ErrorMessage
        title="Не удалось загрузить категории."
        details={describeRequestError(error)}
        onRetry={() => void refetch()}
      />
    ) : null;
  }

  const items = [{ id: null, title: 'Все' }, ...categories];

  return (
    <ul className="catalog-categories nav justify-content-center" aria-label="Категории">
      {items.map(({ id, title }) => {
        const isActive = id === activeId;
        return (
          <li className="nav-item" key={id ?? 'all'}>
            <button
              type="button"
              className={`nav-link${isActive ? ' active' : ''}`}
              aria-pressed={isActive}
              onClick={() => {
                if (!isActive) onSelect(id);
              }}
            >
              {title}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
