/* =============================================================================
   VERIFY — the browser-based check suite. There is no unit-test framework here;
   for a scroll-driven site the browser is the test (see
   .claude/skills/visual-verification/SKILL.md).

   Usage:  node scripts/verify.mjs [baseUrl]        default http://localhost:5173

   Exits non-zero if any check fails, so it works as a pre-merge gate.
   ============================================================================= */

import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'http://localhost:5173';

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };
const NARROW = { width: 360, height: 800 };

const results = [];
const record = (name, pass, detail) => {
  results.push({ name, pass, detail });
  console.log(`${pass ? '  PASS' : '  FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

/** Attach console/page-error collectors. Returns a live, resettable sink. */
/** Noise that is not a defect:
 *  - favicon: absent in some contexts, never meaningful
 *  - /_vercel/insights: Vercel Analytics' script is served by Vercel's edge, so
 *    it 404s on localhost and in `vite preview` by design. Ignoring it keeps
 *    this gate meaningful locally; a gate that always fails is a gate people
 *    stop reading. It still surfaces if it breaks in production, because that
 *    is a different host. */
const IGNORED_REQUESTS = /favicon|\/_vercel\/insights\//;

function watch(page) {
  const sink = { console: [], pageerror: [], failed: [] };
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    // A failed subresource logs a console error whose location is the URL that
    // failed, so the same allowlist has to apply here or the noise just moves.
    if (IGNORED_REQUESTS.test(m.location()?.url ?? '')) return;
    sink.console.push(m.text().slice(0, 200));
  });
  page.on('pageerror', (e) => sink.pageerror.push(String(e).slice(0, 200)));
  page.on('requestfailed', (r) => {
    if (!IGNORED_REQUESTS.test(r.url())) sink.failed.push(r.url());
  });
  page.on('response', (r) => {
    // preview serves a 404 page rather than failing the request outright
    if (r.status() >= 400 && !IGNORED_REQUESTS.test(r.url())) {
      sink.failed.push(`${r.status()} ${r.url()}`);
    }
  });
  sink.reset = () => {
    sink.console.length = 0;
    sink.pageerror.length = 0;
    sink.failed.length = 0;
  };
  return sink;
}

/** The intro gate holds the page inert; wait it out before measuring. */
async function settle(page) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForFunction(() => !document.querySelector('[role="dialog"]'), null, { timeout: 8000 })
    .catch(() => {});
  await page.waitForTimeout(400);
}

/** Count sections by id, not by DOM position. A `main > section` selector is
 *  structure-dependent: ScrollTrigger's pin-spacer re-parents pinned sections,
 *  so that selector silently under-counts on desktop (6) vs mobile (9). */
const SECTION_IDS = [
  'hero', 'marquee', 'about', 'expertise', 'experience',
  'projects', 'skills', 'credentials', 'closing',
];

const probe = (page) =>
  page.evaluate((ids) => ({
    rootChildren: document.getElementById('root')?.children.length ?? 0,
    sections: ids.filter((id) => document.getElementById(id)).length,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    docHeight: document.body.scrollHeight,
  }), SECTION_IDS);

/** Same launch-fallback ladder as scripts/prerender.mjs: bundled Chromium, then
 *  a system Chrome, then a system Chromium. First one that launches wins. */
async function launchBrowser() {
  const strategies = [
    () => chromium.launch(),
    () => chromium.launch({ channel: 'chrome' }),
    () => chromium.launch({ channel: 'chromium' }),
  ];
  for (const launch of strategies) {
    try {
      return await launch();
    } catch {
      /* try the next one */
    }
  }
  throw new Error(
    'Could not launch a browser. Install one with `npx playwright install chromium`.',
  );
}

async function main() {
  const browser = await launchBrowser();

  /* ---------------------------------------------------------------------------
     1. Static viewports — each gets its own fresh page, as a real visitor would.
     --------------------------------------------------------------------------- */
  for (const [label, viewport, touch] of [
    ['desktop 1440x900', DESKTOP, false],
    ['mobile 390x844 (touch)', MOBILE, true],
    ['narrow 360px', NARROW, true],
  ]) {
    const ctx = await browser.newContext({
      viewport,
      ...(touch ? { hasTouch: true, isMobile: true } : {}),
    });
    const page = await ctx.newPage();
    const sink = watch(page);
    await page.goto(BASE);
    await settle(page);

    const m = await probe(page);
    record(
      `${label} — renders`,
      m.rootChildren > 0 && m.sections === SECTION_IDS.length,
      `root children ${m.rootChildren}, ${m.sections}/${SECTION_IDS.length} sections`,
    );
    record(`${label} — no horizontal overflow`, m.overflow === 0, `${m.overflow}px`);
    record(
      `${label} — clean console`,
      sink.console.length === 0 && sink.pageerror.length === 0 && sink.failed.length === 0,
      `console ${sink.console.length}, pageerror ${sink.pageerror.length}, failed req ${sink.failed.length}` +
        (sink.pageerror[0] ? ` :: ${sink.pageerror[0]}` : ''),
    );
    await ctx.close();
  }

  /* ---------------------------------------------------------------------------
     2. Reduced motion — the stranded-end-state failure mode. Every revealed
        element must be VISIBLE, not merely un-animated.
     --------------------------------------------------------------------------- */
  {
    const ctx = await browser.newContext({ viewport: DESKTOP, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    const sink = watch(page);
    await page.goto(BASE);
    await settle(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(600);

    const stranded = await page.evaluate(() =>
      [...document.querySelectorAll('[data-reveal], [data-line], [data-card]')]
        .filter((el) => {
          const s = getComputedStyle(el);
          return s.opacity === '0' || s.visibility === 'hidden';
        }).length,
    );
    record('reduced-motion — nothing stranded hidden', stranded === 0, `${stranded} hidden element(s)`);
    record('reduced-motion — clean console', sink.pageerror.length === 0, `pageerror ${sink.pageerror.length}`);
    await ctx.close();
  }

  /* ---------------------------------------------------------------------------
     3. REGRESSION: crossing the compact breakpoint at runtime.
        useIsCompact() is '(max-width: 640px), (pointer: coarse)'. Crossing it
        swaps Hero and Experience between desktop and mobile components while
        ScrollTrigger pin-spacers are in the DOM. This unmounted the whole tree.
        Fixed viewports never catch it — only the transition does.
     --------------------------------------------------------------------------- */
  for (const [label, from, to] of [
    ['wide -> narrow', DESKTOP, MOBILE],
    ['narrow -> wide', MOBILE, DESKTOP],
  ]) {
    const ctx = await browser.newContext({ viewport: from });
    const page = await ctx.newPage();
    const sink = watch(page);
    await page.goto(BASE);
    await settle(page);
    sink.reset(); // only care about what the resize causes

    await page.setViewportSize(to);
    await page.waitForTimeout(700);

    const m = await probe(page);
    record(
      `breakpoint ${label} — tree survives`,
      m.rootChildren > 0 && m.sections === SECTION_IDS.length,
      `root children ${m.rootChildren}, ${m.sections} sections`,
    );
    record(
      `breakpoint ${label} — no errors on resize`,
      sink.pageerror.length === 0,
      sink.pageerror[0] ?? 'none',
    );
    await ctx.close();
  }

  await browser.close();

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) {
    console.log('\nFailures:');
    for (const f of failed) console.log(`  - ${f.name} (${f.detail})`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
