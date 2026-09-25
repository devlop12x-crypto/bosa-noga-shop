import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { shopApi } from '../api/shopApi';

/** Фабрика, а не синглтон: тесты получают чистый стор на каждый рендер */
export const makeStore = () => {
  const store = configureStore({
    reducer: {
      [shopApi.reducerPath]: shopApi.reducer,
    },
    middleware: (getDefault) => getDefault().concat(shopApi.middleware),
  });
  // Слушатели online/focus для refetchOnReconnect
  setupListeners(store.dispatch);
  return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
