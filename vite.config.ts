import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// base не зашит: при деплое workflow передаёт --base=/<имя-репозитория>/.
// Относительный base ('./') здесь не подходит: у приложения вложенные URL
// (/catalog/20.html), и относительные пути к ассетам на них ломаются.
export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        // Библиотеки — отдельным чанком: они меняются реже кода приложения,
        // и после деплоя браузер берёт их из кэша, скачивая заново только наш код
        codeSplitting: {
          groups: [{ name: 'vendor', test: /node_modules/ }],
        },
      },
    },
  },
  server: {
    // В разработке API ходит через прокси на локальный бэкенд диплома
    proxy: {
      '/api': 'http://localhost:7070',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});
