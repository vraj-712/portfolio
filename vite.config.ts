import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { seo } from './src/config/seo'
import { theme } from './src/config/theme'

/** Injects <title>, meta description, Open Graph tags, theme-color and <html
 *  lang> into index.html from the site config (src/config/seo.ts), at dev and
 *  build time. Keeps SEO in the one config file instead of hand-edited HTML. */
function htmlSeo(): Plugin {
  return {
    name: 'html-seo',
    transformIndexHtml(html) {
      const themeColor = seo.themeColor ?? theme.colorBase
      const tags = [
        { tag: 'title', children: seo.title, injectTo: 'head' as const },
        { tag: 'meta', attrs: { name: 'description', content: seo.description }, injectTo: 'head' as const },
        { tag: 'meta', attrs: { name: 'theme-color', content: themeColor }, injectTo: 'head' as const },
        { tag: 'meta', attrs: { property: 'og:type', content: 'website' }, injectTo: 'head' as const },
        { tag: 'meta', attrs: { property: 'og:title', content: seo.og.title }, injectTo: 'head' as const },
        { tag: 'meta', attrs: { property: 'og:description', content: seo.og.description }, injectTo: 'head' as const },
        ...(seo.og.image
          ? [{ tag: 'meta', attrs: { property: 'og:image', content: seo.og.image }, injectTo: 'head' as const }]
          : []),
      ]
      return {
        html: html.replace(/<html lang="[^"]*">/, `<html lang="${seo.lang}">`),
        tags,
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), htmlSeo()],
  server: {
    allowedHosts: [
      'challenge-fantasize-mothproof.ngrok-free.dev',
    ],
  },
})
