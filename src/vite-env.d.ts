/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Базовый URL API: `/api` в разработке (прокси Vite), адрес Render в продакшене */
  readonly VITE_API_URL: string;
  /** Сколько раз автоматически повторять упавший GET. По умолчанию 3 */
  readonly VITE_API_MAX_RETRIES?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
