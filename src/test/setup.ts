import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Без globals: true Testing Library не чистит DOM сама
afterEach(() => {
  cleanup();
});

// ScrollRestoration вызывает window.scrollTo, которого нет в jsdom
Object.defineProperty(window, 'scrollTo', { value: vi.fn(), writable: true });
