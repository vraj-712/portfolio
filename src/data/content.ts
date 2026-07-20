/* =============================================================================
   Back-compat shim. Content now lives in the site config (src/site.config.ts →
   src/config/content.ts). This file re-exports it so existing imports keep
   working — edit the data in src/config/content.ts, not here.
   ============================================================================= */

export { content } from '../config/content';
export type * from '../config/types';
