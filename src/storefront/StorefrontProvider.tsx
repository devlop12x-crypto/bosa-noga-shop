import type { ReactNode } from 'react';
import { StorefrontContext } from './context';
import type { StorefrontConfig } from './types';

interface StorefrontProviderProps {
  config: StorefrontConfig;
  children: ReactNode;
}

export function StorefrontProvider({ config, children }: StorefrontProviderProps) {
  return (
    <StorefrontContext value={config}>
      {/* React 19 поднимает meta и link в <head>: index.html остаётся без брендовых строк */}
      <meta name="description" content={config.description} />
      <link rel="icon" href={config.favicon} />
      {children}
    </StorefrontContext>
  );
}
