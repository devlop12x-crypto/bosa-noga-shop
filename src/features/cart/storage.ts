import type { CartLine } from '../../core/cart';

/** Хранилище корзины: интерфейс, а не localStorage напрямую — тестам и SSR нужен свой */
export interface CartStorage {
  load(): CartLine[];
  save(lines: readonly CartLine[]): void;
  /** Изменения из других вкладок. Возвращает отписку */
  subscribe(listener: (lines: CartLine[]) => void): () => void;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isPositiveInt = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0;

/** Проверка одной позиции. Шесть полей — своя функция легче схемной библиотеки в бандле */
const isCartLine = (value: unknown): value is CartLine =>
  isRecord(value) &&
  isPositiveInt(value.productId) &&
  typeof value.variantId === 'string' &&
  value.variantId !== '' &&
  typeof value.variantLabel === 'string' &&
  typeof value.title === 'string' &&
  typeof value.price === 'number' &&
  Number.isFinite(value.price) &&
  value.price >= 0 &&
  isPositiveInt(value.quantity);

/** Версия в данных: если формат позиции поменяется, старые корзины не сломают приложение */
const STORAGE_VERSION = 1;

/**
 * localStorage — данные извне: их мог испортить пользователь, расширение или
 * старая версия приложения. Невалидный JSON — пустая корзина, битая позиция — отбрасывается,
 * остальные сохраняются.
 */
export const parseStoredCart = (raw: string | null): CartLine[] => {
  if (!raw) return [];

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return [];
  }

  if (!isRecord(json) || json.version !== STORAGE_VERSION || !Array.isArray(json.lines)) {
    return [];
  }

  // Лишние поля не тащим в стор — только известные
  return json.lines
    .filter(isCartLine)
    .map(({ productId, variantId, variantLabel, title, price, quantity }) => ({
      productId,
      variantId,
      variantLabel,
      title,
      price,
      quantity,
    }));
};

export const serializeCart = (lines: readonly CartLine[]): string =>
  JSON.stringify({ version: STORAGE_VERSION, lines });

export function createLocalCartStorage(storage: Storage, key: string): CartStorage {
  return {
    load() {
      try {
        return parseStoredCart(storage.getItem(key));
      } catch {
        // Хранилище недоступно (приватный режим, запрет cookies) — работаем без него
        return [];
      }
    },

    save(lines) {
      try {
        if (lines.length === 0) storage.removeItem(key);
        else storage.setItem(key, serializeCart(lines));
      } catch {
        // Переполнение или запрет записи не должны ломать покупку
      }
    },

    subscribe(listener) {
      const handleStorage = (event: StorageEvent) => {
        if (event.key === key && event.storageArea === storage) {
          listener(parseStoredCart(event.newValue));
        }
      };
      window.addEventListener('storage', handleStorage);
      return () => window.removeEventListener('storage', handleStorage);
    },
  };
}

/**
 * Корзина в localStorage, а если он недоступен (в некоторых приватных режимах
 * даже обращение к window.localStorage бросает SecurityError) — в памяти вкладки.
 */
export function createBrowserCartStorage(key: string): CartStorage {
  try {
    return createLocalCartStorage(window.localStorage, key);
  } catch {
    return createMemoryCartStorage();
  }
}

/** Корзина в памяти — для тестов и как запасной вариант */
export function createMemoryCartStorage(initial: readonly CartLine[] = []): CartStorage & {
  current: CartLine[];
} {
  const state = {
    current: [...initial],
    load: () => [...state.current],
    save: (lines: readonly CartLine[]) => {
      state.current = [...lines];
    },
    subscribe: () => () => {},
  };
  return state;
}
