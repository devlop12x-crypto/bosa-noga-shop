import { createApi } from '@reduxjs/toolkit/query/react';
import type { OrderItem } from '../core/cart';
import type { Category, CatalogFilter, Product, ProductId, ProductSummary } from '../core/catalog';
import type { OrderOwner } from '../core/order';
import { nextPageOffset } from '../core/catalog';
import { baseQuery } from './baseQuery';
import { CATALOG_PAGE_SIZE } from './config';
import type { CategoryDto, ItemFullDto, ItemShortDto } from './dto';
import { toCategory, toOrderRequest, toProduct, toProductSummary } from './mappers';

export const shopApi = createApi({
  reducerPath: 'shopApi',
  baseQuery,
  // Вернулась сеть — упавшие и устаревшие запросы перезапускаются сами
  refetchOnReconnect: true,
  endpoints: (build) => ({
    getTopSales: build.query<ProductSummary[], void>({
      query: () => 'top-sales',
      transformResponse: (items: ItemShortDto[]) => items.map(toProductSummary),
    }),

    getCategories: build.query<Category[], void>({
      query: () => 'categories',
      transformResponse: (categories: CategoryDto[]) => categories.map(toCategory),
    }),

    /**
     * Каталог порциями. Кэш — на сочетание категории и поиска, поэтому смена
     * фильтра всегда даёт новый запрос, а устаревший ответ не перезапишет свежий.
     */
    getProducts: build.infiniteQuery<ProductSummary[], CatalogFilter, number>({
      infiniteQueryOptions: {
        initialPageParam: 0,
        getNextPageParam: (lastPage, _pages, lastOffset) =>
          nextPageOffset(lastPage.length, lastOffset, CATALOG_PAGE_SIZE),
      },
      query: ({ queryArg: { categoryId, search }, pageParam }) => {
        // Только заданные параметры: «Все» с первой порции — чистый /api/items без «?»
        const params = new URLSearchParams();
        if (categoryId !== null) params.set('categoryId', String(categoryId));
        if (search) params.set('q', search);
        if (pageParam > 0) params.set('offset', String(pageParam));
        const query = params.toString();
        return query ? `items?${query}` : 'items';
      },
      transformResponse: (items: ItemShortDto[]) => items.map(toProductSummary),
      // Ушли из категории — её страницы выбрасываются: при возврате будет свежий запрос
      keepUnusedDataFor: 0,
    }),

    getProduct: build.query<Product, ProductId>({
      query: (id) => `items/${id}`,
      transformResponse: (item: ItemFullDto) => toProduct(item),
    }),

    /** Ответ 204 без тела — fetchBaseQuery превращает его в null, это не ошибка */
    createOrder: build.mutation<null, { owner: OrderOwner; items: readonly OrderItem[] }>({
      query: ({ owner, items }) => ({
        url: 'order',
        method: 'POST',
        body: toOrderRequest(owner, items),
      }),
    }),
  }),
});

export const {
  useGetTopSalesQuery,
  useGetCategoriesQuery,
  useGetProductsInfiniteQuery,
  useGetProductQuery,
} = shopApi;
