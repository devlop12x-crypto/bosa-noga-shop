import type { ReactNode } from 'react';
import type { CatalogFilter, CategoryId } from '../../core/catalog';
import { CategoriesNav } from './CategoriesNav';
import { ProductGrid } from './ProductGrid';

interface CatalogProps {
  filter: CatalogFilter;
  onCategoryChange: (id: CategoryId | null) => void;
  onResetSearch?: () => void;
  /** Поле поиска — только на странице каталога */
  searchSlot?: ReactNode;
}

/**
 * Каталог один на главную и страницу каталога. Где хранится фильтр — решает
 * страница: главная держит категорию в state, каталог — в URL.
 */
export function Catalog({ filter, onCategoryChange, onResetSearch, searchSlot }: CatalogProps) {
  return (
    <section className="catalog">
      <h2 className="text-center">Каталог</h2>
      {searchSlot}
      <CategoriesNav activeId={filter.categoryId} onSelect={onCategoryChange} />
      <ProductGrid filter={filter} {...(onResetSearch && { onResetSearch })} />
    </section>
  );
}
