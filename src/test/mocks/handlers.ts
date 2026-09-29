import { http, HttpResponse } from 'msw';
import { categoriesFixture, findItem, itemsFixture, topSalesFixture, toShort } from './fixtures';

const PAGE_SIZE = 6;

/** Логика повторяет бэкенд диплома: категория, поиск по названию или точному цвету, offset */
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
      .map(toShort);

    return HttpResponse.json(page);
  }),

  http.get('*/api/items/:id', ({ params }) => {
    const item = findItem(Number(params.id));
    // Как у бэкенда: 404 с JSON-строкой в теле
    return item ? HttpResponse.json(item) : HttpResponse.json('Not found', { status: 404 });
  }),

  // Как у бэкенда: 204 без тела
  http.post('*/api/order', () => new HttpResponse(null, { status: 204 })),
];
