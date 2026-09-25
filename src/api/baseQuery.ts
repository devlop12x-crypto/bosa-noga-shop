import { fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { resolveApiBaseUrl } from './config';
import { parseMaxRetries, shouldRetry } from './retryPolicy';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: resolveApiBaseUrl(import.meta.env.VITE_API_URL, window.location.origin),
});

const maxRetries = parseMaxRetries(import.meta.env.VITE_API_MAX_RETRIES);

/**
 * fetchBaseQuery с автоповтором по политике shouldRetry и экспоненциальной задержкой.
 * maxRetries и retryCondition в RTK взаимоисключающие — лимит попыток проверяет сама политика.
 */
export const baseQuery = retry(rawBaseQuery, {
  retryCondition: (error, _args, { attempt, baseQueryApi }) =>
    shouldRetry(error as FetchBaseQueryError, attempt, baseQueryApi.type, maxRetries),
});
