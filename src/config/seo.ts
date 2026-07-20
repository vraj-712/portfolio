/* =============================================================================
   SEO — page <title>, meta description, and social-share (Open Graph) preview.
   These values are injected into index.html at build/dev time by the
   htmlSeo() plugin in vite.config.ts, so there's nothing to hand-edit in HTML.
   ============================================================================= */

import type { SeoConfig } from './types';
import { theme } from './theme';

export const seo: SeoConfig = {
  title: 'Vraj Patel — Full Stack Software Developer',
  description:
    'Vraj Patel — Full Stack Software Developer building production web, mobile, and TV applications with React, Next.js, React Native, and the MERN stack.',
  og: {
    title: 'Vraj Patel — Full Stack Software Developer',
    description:
      'Engineering with precision. Designing with purpose. Building experiences that people remember.',
    // image: '/og-cover.png', // TODO add a 1200×630 share image in /public
  },
  // Browser UI tint — matches the page canvas so mobile chrome blends in.
  themeColor: theme.colorBase,
  lang: 'en',
};
