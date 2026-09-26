import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { server } from './mocks/server';

// Любой запрос без обработчика — ошибка теста, а не тихий поход в сеть
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Без globals: true Testing Library не чистит DOM сама
afterEach(() => {
  cleanup();
  server.resetHandlers();
  server.events.removeAllListeners();
});

afterAll(() => server.close());

// ScrollRestoration вызывает window.scrollTo, которого нет в jsdom
Object.defineProperty(window, 'scrollTo', { value: vi.fn(), writable: true });
