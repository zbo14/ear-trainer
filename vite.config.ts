import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import Sitemap from 'vite-plugin-sitemap';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const iconsPath = 'node_modules/@shoelace-style/shoelace/dist/assets/icons';

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /\/assets\/icons\/(.+)/,
        replacement: `${iconsPath}/$1`,
      },
    ],
  },

  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: iconsPath,
          dest: 'assets',
        },
      ],
    }),
    Sitemap({ hostname: 'https://eartrainer.xyz' }),
    createHtmlPlugin(),
  ],
});
