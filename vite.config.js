import { defineConfig } from 'vite';
import { glob } from 'glob';
import { readFileSync } from 'fs';
import path from 'path';
import injectHTML from 'vite-plugin-html-inject';
import FullReload from 'vite-plugin-full-reload';
import SortCss from 'postcss-sort-media-queries';

// Map: basename → relative dir from src/ (e.g. "1.png" → "images/gallery/small")
const imgFileMap = new Map(
  glob.sync('./src/images/**/*.{png,webp,jpg,jpeg,gif}').map(file => [
    path.basename(file),
    path.relative('./src', path.dirname(file)).replace(/\\/g, '/'),
  ])
);

// Emit large images that are in <a href> and ignored by Vite asset pipeline
function emitHrefImages() {
  return {
    name: 'emit-href-images',
    buildStart() {
      const files = glob.sync('./src/images/gallery/{large,large-jpg}/**/*.{webp,jpg,jpeg}');
      for (const file of files) {
        const name = path.relative('./src', file).replace(/\\/g, '/');
        this.emitFile({ type: 'asset', name, source: readFileSync(file) });
      }
    },
  };
}

export default defineConfig(({ command }) => {
  return {
    base: command === 'serve' ? '/goit-advancedjs-hw-01/' : './',
    define: {
      [command === 'serve' ? 'global' : '_global']: {},
    },
    root: 'src',
    publicDir: '../public',
    build: {
      sourcemap: true,
      rollupOptions: {
        input: glob.sync('./src/*.html'),
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
          entryFileNames: chunkInfo => {
            if (chunkInfo.name === 'commonHelpers') {
              return 'commonHelpers.js';
            }
            return '[name].js';
          },
          chunkFileNames: 'js/[name]-[hash].js',
          assetFileNames: assetInfo => {
            if (assetInfo.name?.endsWith('.css')) {
              return 'css/[name]-[hash][extname]';
            }
            if (assetInfo.name?.match(/\.(png|jpe?g|webp|gif)$/i)) {
              if (assetInfo.name.includes('/')) {
                return '[name]-[hash][extname]';
              }
              const dir = imgFileMap.get(assetInfo.name) ?? 'images';
              return `${dir}/[name]-[hash][extname]`;
            }
            return 'assets/[name]-[hash][extname]';
          },
        },
      },
      outDir: '../dist',
      emptyOutDir: true,
    },
    plugins: [
      emitHrefImages(),
      injectHTML(),
      FullReload(['./src/**/**.html']),
      SortCss({
        sort: 'mobile-first',
      }),
    ],
  };
});
