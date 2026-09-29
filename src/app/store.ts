import {
  combineReducers,
  configureStore,
  createListenerMiddleware,
  isAnyOf,
} from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { shopApi } from '../api/shopApi';
import {
  cartSlice,
  cleared,
  lineAdded,
  lineRemoved,
  pricesAccepted,
  selectCartLines,
  synced,
} from '../features/cart/cartSlice';
import type { CartStorage } from '../features/cart/storage';
import { createMemoryCartStorage } from '../features/cart/storage';
import { checkoutSlice } from '../features/checkout/checkoutSlice';

const rootReducer = combineReducers({
  [shopApi.reducerPath]: shopApi.reducer,
  [cartSlice.reducerPath]: cartSlice.reducer,
  [checkoutSlice.reducerPath]: checkoutSlice.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

interface MakeStoreOptions {
  /** Где живёт корзина. В браузере — localStorage, в тестах — память */
  cartStorage?: CartStorage;
}

/** Фабрика, а не синглтон: тесты получают чистый стор на каждый рендер */
export const makeStore = ({ cartStorage = createMemoryCartStorage() }: MakeStoreOptions = {}) => {
  const persistence = createListenerMiddleware();

  const store = configureStore({
    reducer: rootReducer,
    preloadedState: { cart: { lines: cartStorage.load() } },
    middleware: (getDefault) =>
      getDefault().prepend(persistence.middleware).concat(shopApi.middleware),
  });

  // Любое изменение корзины в этой вкладке — сразу в хранилище.
  // synced не сохраняем: он сам пришёл из хранилища (другая вкладка).
  persistence.startListening({
    matcher: isAnyOf(lineAdded, lineRemoved, pricesAccepted, cleared),
    effect: (_action, api) => {
      cartStorage.save(selectCartLines(api.getState() as RootState));
    },
  });

  const unsubscribeStorage = cartStorage.subscribe((lines) => store.dispatch(synced(lines)));

  // Слушатели online/focus для refetchOnReconnect.
  // В RTK они глобальные на модуль: пока первый стор не отписался, следующий их не получит.
  // В приложении стор один, а тестам нужен dispose, иначе после первого теста сеть «не возвращается».
  const unsubscribeListeners = setupListeners(store.dispatch);

  return Object.assign(store, {
    /** Снимает подписки на window: события сети и изменения корзины в других вкладках */
    dispose() {
      unsubscribeListeners();
      unsubscribeStorage();
      persistence.clearListeners();
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];
