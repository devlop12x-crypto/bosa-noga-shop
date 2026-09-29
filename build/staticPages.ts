import { copyFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Plugin, ResolvedConfig } from 'vite';

/**
 * Копии index.html под именами страниц для статического хостинга (GitHub Pages).
 *
 * Pages не умеет перенаправлять все пути на одну страницу. Без копий прямой заход
 * на /catalog.html находит только 404.html: приложение внутри то же, но ответ — 404
 * (красная ошибка в DevTools, поисковик считает страницу несуществующей).
 * С копиями постоянные страницы отвечают 200, а 404.html остаётся запасным входом
 * для динамических адресов (/catalog/20.html) и действительно несуществующих путей.
 */
export function staticPages(pages: readonly string[]): Plugin {
  let config: ResolvedConfig;

  return {
    name: 'static-pages',
    apply: 'build',
    configResolved(resolved) {
      config = resolved;
    },
    async closeBundle() {
      const outDir = join(config.root, config.build.outDir);
      const index = join(outDir, 'index.html');
      await Promise.all([...pages, '404.html'].map((page) => copyFile(index, join(outDir, page))));
    },
  };
}
