import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export const DEFAULT_MAX_RETRIES = 3;

/** Число повторов из env: в тестах 0, чтобы ошибки приходили сразу, без ожидания задержек */
export const parseMaxRetries = (raw: string | undefined): number => {
  const value = Number(raw);
  return raw !== undefined && raw !== '' && Number.isInteger(value) && value >= 0
    ? value
    : DEFAULT_MAX_RETRIES;
};

/**
 * Какие ошибки повторять автоматически.
 * - только чтение: POST заказа не идемпотентен, повтор может создать дубль;
 * - только сбои сети и 5xx: 404 или 400 при повторе не исправятся;
 * - отменённый запрос (ушли со страницы, сменили категорию) не повторяем.
 */
export const shouldRetry = (
  error: FetchBaseQueryError,
  attempt: number,
  requestType: 'query' | 'mutation',
  maxRetries = DEFAULT_MAX_RETRIES,
): boolean => {
  if (requestType !== 'query' || attempt > maxRetries) return false;

  const { status } = error;
  if (status === 'FETCH_ERROR' || status === 'TIMEOUT_ERROR') return true;
  return typeof status === 'number' && status >= 500;
};
