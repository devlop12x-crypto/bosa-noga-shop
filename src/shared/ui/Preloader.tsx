import { useEffect, useState } from 'react';

/** Через сколько показывать подсказку про медленный ответ (холодный старт бэкенда на Render) */
const SLOW_HINT_DELAY_MS = 8000;

interface PreloaderProps {
  /** Что грузится — для скринридера */
  label?: string;
}

export function Preloader({ label = 'Загрузка' }: PreloaderProps) {
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsSlow(true), SLOW_HINT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div role="status" aria-label={label}>
      <div className="preloader" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      {isSlow && (
        <p className="text-center text-muted small">
          Сервер просыпается после простоя — это может занять до минуты.
        </p>
      )}
    </div>
  );
}
