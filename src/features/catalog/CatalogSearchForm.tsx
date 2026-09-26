import { useState } from 'react';
import type { FormEvent } from 'react';
import { normalizeSearch } from '../../core/catalog';

interface CatalogSearchFormProps {
  /** Текущий запрос из URL. Смена запроса извне (поиск в шапке) — пересоздание формы через key */
  initialValue: string;
  onSubmit: (search: string) => void;
}

/** Поле поиска каталога. Срабатывает по Enter, не на каждый символ (требование задания) */
export function CatalogSearchForm({ initialValue, onSubmit }: CatalogSearchFormProps) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const search = normalizeSearch(value);
    setValue(search);
    onSubmit(search);
  };

  return (
    <form className="catalog-search-form form-inline" role="search" onSubmit={handleSubmit}>
      <input
        type="search"
        name="q"
        className="form-control"
        placeholder="Поиск"
        aria-label="Поиск по каталогу"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    </form>
  );
}
