import { useSearchParams } from 'react-router';
import type { CategoryId } from '../core/catalog';
import { normalizeSearch, parseCategoryId } from '../core/catalog';
import { Catalog } from '../features/catalog/Catalog';
import { CatalogSearchForm } from '../features/catalog/CatalogSearchForm';
import { PageTitle } from '../shared/ui/PageTitle';

/**
 * Фильтр каталога живёт в URL: /catalog.html?q=жар&category=13.
 * Поиск из шапки просто ведёт сюда с ?q=, запрос переживает перезагрузку и «Назад».
 */
export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = normalizeSearch(searchParams.get('q') ?? '');
  const categoryId = parseCategoryId(searchParams.get('category'));

  const updateParams = (patch: { q?: string; category?: CategoryId | null }) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if ('q' in patch) {
        if (patch.q) next.set('q', patch.q);
        else next.delete('q');
      }
      if ('category' in patch) {
        if (patch.category === null || patch.category === undefined) next.delete('category');
        else next.set('category', String(patch.category));
      }
      return next;
    });
  };

  return (
    <>
      <PageTitle>{search ? `Поиск: ${search}` : 'Каталог'}</PageTitle>
      <Catalog
        filter={{ categoryId, search }}
        onCategoryChange={(category) => updateParams({ category })}
        onResetSearch={() => updateParams({ q: '' })}
        searchSlot={
          <CatalogSearchForm
            key={search}
            initialValue={search}
            onSubmit={(q) => updateParams({ q })}
          />
        }
      />
    </>
  );
}
