import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

/** Человеческое объяснение ошибки запроса — без кодов и стектрейсов */
export const describeRequestError = (
  error: FetchBaseQueryError | SerializedError | undefined,
): string => {
  if (!error || !('status' in error)) return 'Что-то пошло не так.';

  switch (error.status) {
    case 'FETCH_ERROR':
      return 'Нет связи с сервером. Проверьте подключение к интернету.';
    case 'TIMEOUT_ERROR':
      return 'Сервер слишком долго не отвечает.';
    case 'PARSING_ERROR':
      return 'Сервер прислал неожиданный ответ.';
    default:
      if (typeof error.status === 'number' && error.status >= 500) {
        return 'Сервер временно недоступен.';
      }
      if (error.status === 404) return 'Данные не найдены.';
      return 'Что-то пошло не так.';
  }
};
