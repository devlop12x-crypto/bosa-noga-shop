import { useState } from 'react';
import type { CategoryId } from '../core/catalog';
import { Catalog } from '../features/catalog/Catalog';
import { TopSales } from '../features/topSales/TopSales';
import { PageTitle } from '../shared/ui/PageTitle';

export function HomePage() {
  const [categoryId, setCategoryId] = useState<CategoryId | null>(null);

  return (
    <>
      <PageTitle />
      <TopSales />
      <Catalog filter={{ categoryId, search: '' }} onCategoryChange={setCategoryId} />
    </>
  );
}
