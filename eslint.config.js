import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  // Первой записью: без неё линтер после сборки разбирает минифицированный dist
  { ignores: ['dist', 'node_modules', 'coverage'] },

  js.configs.recommended,
  tseslint.configs.recommended,

  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
      reactHooks.configs.flat.recommended,
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // Типы пропсов проверяет TypeScript
      'react/prop-types': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
      eqeqeq: ['error', 'always'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // Бренд подключается только в точке входа. Остальной код видит его
  // через useStorefront(), поэтому не может случайно зашить «обувь».
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/main.tsx', 'src/brands/**', 'src/test/**', 'src/**/*.test.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/brands/**', '**/brands'],
              message:
                'Бренд подключается только в main.tsx. Данные магазина — через useStorefront().',
            },
          ],
        },
      ],
    },
  },

  // Логическое ядро — чистый TypeScript: без React, Redux, HTTP и знания о бренде.
  {
    files: ['src/core/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react', 'react-*', 'react/*', '@reduxjs/*', 'react-redux'],
              message: 'Ядро не зависит от UI и библиотек состояния.',
            },
            {
              group: ['api', 'brands', 'storefront', 'features', 'pages', 'app', 'layout'].flatMap(
                (layer) => [`**/${layer}`, `**/${layer}/**`],
              ),
              message: 'Ядро не импортирует внешние слои — зависимости направлены внутрь.',
            },
          ],
        },
      ],
    },
  },

  {
    files: ['*.{js,ts}'],
    languageOptions: {
      globals: globals.node,
    },
  },

  // Отключает правила, конфликтующие с Prettier. Должен идти последним.
  prettier,
);
