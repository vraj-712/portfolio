/**
 * Dynamic Open Graph image — /api/og
 * ---------------------------------------------------------------------------
 * Renders the site's social-share card at request time (1200×630) instead of
 * shipping a static PNG, so it can never drift from the live brand.
 *
 * IMPORTANT: this is a Vercel Function living at the project ROOT (not in src/,
 * not part of the Vite build). It does NOT run under `vite dev` — Vite knows
 * nothing about /api. To exercise it locally use `bunx vercel dev` (or
 * `npx vercel dev`); otherwise test it on a Vercel preview deployment.
 *
 * @vercel/og is the framework-agnostic package that next/og wraps — it renders
 * JSX to an image via satori + resvg, no Next.js and no app/ directory needed.
 *
 * RUNTIME = nodejs (NOT edge). @vercel/og cannot run on the Edge runtime
 * *outside* Next.js: its own bundled fallback font is loaded with
 * `fetch(new URL('./noto-sans…ttf', import.meta.url))`, which the standalone
 * Edge bundler rejects as an unsupported `vc-blob-asset:` module (Next.js has
 * private handling for this that a bare Vite/Vercel deploy lacks — see
 * github.com/vercel/satori#582). The Node serverless runtime has no such
 * restriction: @vercel/og resolves to its Node build and reads local font
 * files straight off disk. OG images are CDN-cached after first render, so the
 * Node cold-start cost is paid at most once per deploy.
 */
import { readFileSync } from 'node:fs';
import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'nodejs' };

/* --- Brand tokens — copied verbatim from src/styles/theme.css :root (the
   "Midnight · Cyan" default in src/config/theme.ts). Keep in sync with those. */
const BASE = '#0C0F12'; // --color-base   — page canvas
const INK = '#E9EEF0'; // --color-ink     — primary text / borders / frame
const INK_MUTED = '#9EA2A5'; // --color-ink-muted — meta / captions
const ACCENT = '#29E0D4'; // --color-accent — rationed emphasis

/* --- The one genuinely computed value ---------------------------------------
   Anchored to the first professional software role (Prime Apps internship,
   Nov 2023 — where the production foundation got built). Years of experience
   and the date mark are derived from the request clock, so the card ages
   itself and never needs a manual edit. */
const CAREER_START = new Date('2023-11-01T00:00:00Z');

function experienceYears(now: Date): number {
  const ms = now.getTime() - CAREER_START.getTime();
  return Math.max(1, Math.floor(ms / (365.25 * 24 * 60 * 60 * 1000)));
}

// satori cannot use system fonts — the real display + mono faces are read off
// disk as Buffers. Static TTF instances of the site's Bricolage Grotesque
// (display) and Space Mono (mono) faces; satori can't read the woff2/variable
// files the site serves to browsers. Each path MUST be a static string literal
// inside `new URL(..., import.meta.url)` so Vercel's file tracer (@vercel/nft)
// can see it and bundle the TTF with the function. Loaded once at module scope
// so warm invocations reuse them instead of re-reading on every request.
const displayBold = readFileSync(new URL('./assets/BricolageGrotesque-Bold.ttf', import.meta.url));
const displayRegular = readFileSync(new URL('./assets/BricolageGrotesque-Regular.ttf', import.meta.url));
const monoRegular = readFileSync(new URL('./assets/SpaceMono-Regular.ttf', import.meta.url));
const monoBold = readFileSync(new URL('./assets/SpaceMono-Bold.ttf', import.meta.url));

export default function handler(): ImageResponse {
  const now = new Date();
  const years = experienceYears(now);
  const year = now.getUTCFullYear();

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '1200px',
          height: '630px',
          background: BASE,
          fontFamily: 'Bricolage Grotesque',
        }}
      >
        {/* Thick brutalist frame — solid ink, no radius, no shadow */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            height: '100%',
            border: `14px solid ${INK}`,
            padding: '54px 64px',
          }}
        >
          {/* Top row — mono eyebrow (left) + computed tenure mark (right) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div
              style={{
                display: 'flex',
                fontFamily: 'Space Mono',
                fontSize: '24px',
                letterSpacing: '4px',
                color: INK,
              }}
            >
              PORTFOLIO / FULL-STACK ENGINEER
            </div>
            <div
              style={{
                display: 'flex',
                fontFamily: 'Space Mono',
                fontWeight: 700,
                fontSize: '24px',
                letterSpacing: '4px',
                color: ACCENT,
              }}
            >
              {years}+ YRS SHIPPING
            </div>
          </div>

          {/* Headline — oversized bold name + role, mono subtitle beneath */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                display: 'flex',
                fontFamily: 'Bricolage Grotesque',
                fontWeight: 700,
                fontSize: '156px',
                lineHeight: 0.92,
                letterSpacing: '-5px',
                color: INK,
              }}
            >
              Vraj Patel
            </div>
            <div
              style={{
                display: 'flex',
                fontFamily: 'Bricolage Grotesque',
                fontWeight: 700,
                fontSize: '62px',
                lineHeight: 1,
                letterSpacing: '-1px',
                color: ACCENT,
                marginTop: '10px',
              }}
            >
              Full Stack Software Developer
            </div>
            <div
              style={{
                display: 'flex',
                fontFamily: 'Space Mono',
                fontSize: '26px',
                color: INK_MUTED,
                marginTop: '28px',
              }}
            >
              Next.js · Postgres · React Native · MERN — web, mobile &amp; TV
            </div>
          </div>

          {/* Bottom row — computed tenure line (left) + boxed wordmark (right) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div
              style={{
                display: 'flex',
                fontFamily: 'Space Mono',
                fontSize: '22px',
                color: INK_MUTED,
              }}
            >
              {years} years building production software · {year}
            </div>
            <div
              style={{
                display: 'flex',
                fontFamily: 'Bricolage Grotesque',
                fontWeight: 700,
                fontSize: '52px',
                lineHeight: 1,
                color: INK,
                border: `4px solid ${INK}`,
                padding: '4px 18px 8px',
              }}
            >
              VP
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Bricolage Grotesque', data: displayBold, weight: 700, style: 'normal' },
        { name: 'Bricolage Grotesque', data: displayRegular, weight: 400, style: 'normal' },
        { name: 'Space Mono', data: monoRegular, weight: 400, style: 'normal' },
        { name: 'Space Mono', data: monoBold, weight: 700, style: 'normal' },
      ],
    },
  );
}
