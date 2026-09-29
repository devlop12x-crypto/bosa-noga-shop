import { useOnlineStatus } from '../hooks/useOnlineStatus';

/**
 * Плашка «нет сети». Ничего не нужно нажимать: когда сеть вернётся,
 * RTK Query сам перезапросит данные (refetchOnReconnect), и плашка исчезнет.
 */
export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  // role="status" стоит всегда: скринридер объявляет изменения только в уже существующей live-области
  return (
    <div role="status" aria-live="polite">
      {!isOnline && (
        <div className="alert alert-warning text-center mb-0 offline-banner">
          Нет соединения с интернетом. Показаны уже загруженные данные — всё обновится само, когда
          сеть вернётся.
        </div>
      )}
    </div>
  );
}
