import { server } from './server';

/** Записывает query-строки запросов к /api/items — чтобы проверять, что именно ушло на сервер */
export function recordItemsRequests(): URLSearchParams[] {
  const log: URLSearchParams[] = [];
  server.events.on('request:start', ({ request }) => {
    const url = new URL(request.url);
    if (url.pathname.endsWith('/api/items')) log.push(url.searchParams);
  });
  return log;
}
