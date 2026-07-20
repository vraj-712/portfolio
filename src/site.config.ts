/* =============================================================================
   ███  SITE CONFIG — THE ONE FILE YOU EDIT TO REBRAND THIS SITE.  ███

   Everything a person needs to make this portfolio their own lives in the four
   modules re-exported below. Edit the data there; the whole app reads from here.

     ./config/content.ts  → profile, experience, projects, skills, links   (who)
     ./config/labels.ts   → section headings, CTAs, UI copy                (words)
     ./config/theme.ts    → colors, fonts, default look                    (identity)
     ./config/seo.ts      → page title, description, social-share preview  (meta)

   Assets (résumé PDF, project images, OG cover) are files under /public — the
   config holds their paths, so swap the files and update the paths.

   Nothing else in src/ needs touching for a rebrand. Types in ./config/types.ts
   keep every value in the right shape.
   ============================================================================= */

import type { SiteConfig } from './config/types';
import { content } from './config/content';
import { labels } from './config/labels';
import { theme } from './config/theme';
import { seo } from './config/seo';

export const site: SiteConfig = { content, labels, theme, seo };

// Named re-exports so existing/imports can pull just the slice they need.
export { content, labels, theme, seo };
export type * from './config/types';
