interface ErrorMessageProps {
  /** Что не получилось: «Не удалось загрузить каталог» */
  title: string;
  /** Почему — из describeRequestError */
  details?: string;
  onRetry: () => void;
}

/**
 * Ошибка внутри виджета: остальная страница продолжает работать,
 * повтор — без перезагрузки.
 */
export function ErrorMessage({ title, details, onRetry }: ErrorMessageProps) {
  return (
    <div className="text-center my-4" role="alert">
      <p className="mb-1">{title}</p>
      {details && <p className="text-muted small">{details}</p>}
      <button type="button" className="btn btn-outline-primary" onClick={onRetry}>
        Повторить
      </button>
    </div>
  );
}
