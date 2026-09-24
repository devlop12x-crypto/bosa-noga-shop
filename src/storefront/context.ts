import { createContext, useContext } from 'react';
import type { StorefrontConfig } from './types';

export const StorefrontContext = createContext<StorefrontConfig | null>(null);

/** Конфигурация текущего магазина. Единственный способ для UI узнать о бренде */
export function useStorefront(): StorefrontConfig {
  const config = useContext(StorefrontContext);
  if (!config) {
    throw new Error('useStorefront() вызван вне <StorefrontProvider>');
  }
  return config;
}
