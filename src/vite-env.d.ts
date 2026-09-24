/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Базовый URL API: `/api` в разработке (прокси Vite), адрес Render в продакшене */
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
