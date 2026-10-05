import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/* Preload the two fonts the first screen actually paints with.
 *
 * Fontsource faces are only discoverable once the CSS has been fetched and
 * parsed, so the hero — an H1 in the display face, and the LCP element — waits
 * an extra round trip before it can paint with its real font.
 *
 * This lives in the bundler, not in scripts/prerender.mjs, on purpose. The
 * prerender step is fail-open off Vercel: on a build host with no Chromium it
 * warns and ships the CSR build (Vercel's own host did this until
 * scripts/vercel-install.sh). Injecting preloads there meant they silently
 * never shipped in production — verified against the live site, which served
 * 0 preloads while a local build served 2. A Vite hook needs no browser, so
 * the preloads ship wherever the bundle does.
 *
 * Only the `latin` subsets of the two faces visible above the fold: the display
 * face for the name, and mono 400 for the status chip and clock. Preloading
 * latin-ext, vietnamese, the italics or mono 700 would compete for bandwidth
 * with the LCP itself and make matters worse.
 */
const FIRST_PAINT_FONTS = [
  /^bricolage-grotesque-latin-wght-normal-.*\.woff2$/,
  /^space-mono-latin-400-normal-.*\.woff2$/,
]

function preloadFirstPaintFonts(): Plugin {
  return {
    name: 'preload-first-paint-fonts',
    apply: 'build',
    transformIndexHtml: {
      // `post` so the bundle is populated and the content hashes are final.
      order: 'post',
      handler(_html, ctx) {
        const files = Object.keys(ctx.bundle ?? {})
        return FIRST_PAINT_FONTS.flatMap((pattern) => {
          const match = files.find((f) => pattern.test(f.split('/').pop() ?? ''))
          if (!match) return []
          return [
            {
              tag: 'link',
              injectTo: 'head-prepend' as const,
              attrs: {
                rel: 'preload',
                as: 'font',
                type: 'font/woff2',
                crossorigin: '',
                href: `/${match}`,
              },
            },
          ]
        })
      },
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), preloadFirstPaintFonts()],
  server: {
    allowedHosts: [
      'challenge-fantasize-mothproof.ngrok-free.dev',
    ],
  },
})
