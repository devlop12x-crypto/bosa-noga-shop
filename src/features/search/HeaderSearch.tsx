import { useEffect, useId, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent, ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { catalogSearchPath } from '../../shared/config/routes';

interface HeaderSearchProps {
  /** Остальные иконки шапки (корзина) — стоят в одном ряду с иконкой поиска */
  children?: ReactNode;
}

/**
 * Поиск в шапке.
 * Первый клик по иконке раскрывает поле. Второй клик (или Enter) при непустом
 * запросе ведёт в каталог с `?q=...`, при пустом — схлопывает поле обратно.
 */
export function HeaderSearch({ children }: HeaderSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const formId = useId();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const close = () => {
    setIsOpen(false);
    setQuery('');
  };

  const submit = () => {
    const trimmed = query.trim();
    close();
    if (trimmed) void navigate(catalogSearchPath(trimmed));
  };

  const handleIconClick = () => {
    if (isOpen) submit();
    else setIsOpen(true);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') close();
  };

  return (
    <div>
      <div className="header-controls-pics">
        <button
          type="button"
          className="header-controls-pic header-controls-search"
          aria-label={isOpen ? 'Найти' : 'Открыть поиск'}
          aria-expanded={isOpen}
          aria-controls={formId}
          onClick={handleIconClick}
        />
        {children}
      </div>
      {/* Bootstrap-класс invisible даёт visibility: hidden — скрытое поле недоступно с клавиатуры */}
      <form
        id={formId}
        role="search"
        className={`header-controls-search-form form-inline${isOpen ? '' : ' invisible'}`}
        onSubmit={handleSubmit}
      >
        <input
          ref={inputRef}
          type="search"
          name="q"
          className="form-control"
          placeholder="Поиск"
          aria-label="Поиск по каталогу"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
        />
      </form>
    </div>
  );
}
