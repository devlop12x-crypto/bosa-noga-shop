import { http, HttpResponse } from 'msw';
import { categoriesFixture, itemsFixture, topSalesFixture } from './fixtures';

const PAGE_SIZE = 6;

/** Логика фильтрации повторяет бэкенд диплома: категория, поиск по названию или точному цвету, offset */
export const handlers = [
  http.get('*/api/top-sales', () => HttpResponse.json(topSalesFixture)),

  http.get('*/api/categories', () => HttpResponse.json(categoriesFixture)),

  http.get('*/api/items', ({ request }) => {
    const params = new URL(request.url).searchParams;
    const categoryId = Number(params.get('categoryId') ?? 0);
    const offset = Number(params.get('offset') ?? 0);
    const q = (params.get('q') ?? '').trim().toLowerCase();

    const page = itemsFixture
      .filter((item) => categoryId === 0 || item.category === categoryId)
      .filter((item) => item.title.toLowerCase().includes(q) || item.color.toLowerCase() === q)
      .slice(offset, offset + PAGE_SIZE)
      .map(({ color: _color, ...item }) => item);

    return HttpResponse.json(page);
  }),
];
