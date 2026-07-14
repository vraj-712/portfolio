/// <reference types="vite/client" />

// Fontsource CSS side-effect modules — exact-match ambient declarations so the
// type-checker short-circuits file resolution (avoids TS5083 under bundler
// resolution + allowArbitraryExtensions).
declare module '@fontsource-variable/bricolage-grotesque/index.css';
declare module '@fontsource/space-mono/400.css';
declare module '@fontsource/space-mono/700.css';
declare module '@fontsource/space-mono/400-italic.css';
