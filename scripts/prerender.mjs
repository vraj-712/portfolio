/* Post-build prerender. Loads the built SPA in a headless browser with reduced
 * motion (so GSAP reveals don't hide content), then writes the fully-rendered
 * HTML back into dist/index.html. This gives non-JS crawlers and link-preview
 * bots the actual page content — the build-time SEO/OG/JSON-LD tags are already
 * in the head; this adds the <body>.
 *
 * FAIL-OPEN locally: if a browser can't be launched, it warns loudly and exits
 * 0 so the build still ships the CSR bundle. To run prerender on such a host,
 * install the browser first: `npx playwright install --only-shell chromium`.
 *
 * FAIL-CLOSED on Vercel (VERCEL is set): a skipped prerender there would ship
 * an empty #root to crawlers, so it exits 1 and Vercel keeps serving the
 * previous deployment. scripts/vercel-install.sh provisions Chromium there.
 *
 * Does NOT touch design, layout, or animation of the live app — real visitors
 * still get the full JS experience (React re-renders into #root).
 */
import { createServer } from 'node:http';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { join, extname, resolve } from 'node:path';

const DIST = resolve(process.cwd(), 'dist');
const PORT = 4188;
const FAIL_CLOSED = Boolean(process.env.VERCEL);

/** Report a skipped prerender; fails the build only when FAIL_CLOSED. */
function skip(reason, details = []) {
  const outcome = FAIL_CLOSED
    ? 'failing the build (VERCEL is set, refusing to ship an empty #root).'
    : 'skipping prerender (shipping CSR build).';
  console.warn([`\n[prerender] ${reason} — ${outcome}`, ...details].join('\n[prerender] ') + '\n');
  process.exitCode = FAIL_CLOSED ? 1 : 0;
}

const TYPES = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.xml': 'application/xml',
  '.txt': 'text/plain',
};

/** Minimal static server for dist/, with SPA fallback to index.html. */
function serveDist() {
  return createServer(async (req, res) => {
    try {
      const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
      let filePath = join(DIST, urlPath === '/' ? 'index.html' : urlPath);
      let s = await stat(filePath).catch(() => null);
      if (!s || s.isDirectory()) filePath = join(DIST, 'index.html'); // SPA fallback
      const body = await readFile(filePath);
      res.writeHead(200, { 'content-type': TYPES[extname(filePath)] || 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(500);
      res.end('prerender static server error');
    }
  });
}

async function main() {
  // Import Playwright lazily so a missing dep degrades to fail-open, not a crash.
  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    skip('Playwright not available');
    return;
  }

  const server = serveDist();
  await new Promise((r) => server.listen(PORT, r));

  // Try, in order: Playwright's bundled Chromium (the CI path after
  // `playwright install chromium`), then a system Chrome/Chromium (common on
  // dev machines). First one that launches wins.
  const strategies = [
    ['bundled chromium', () => chromium.launch()],
    ['channel "chrome"', () => chromium.launch({ channel: 'chrome' })],
    ['channel "chromium"', () => chromium.launch({ channel: 'chromium' })],
  ];
  let browser = null;
  // Keep every strategy's error: the last one alone is misleading (it reports a
  // missing channel when the real failure is the bundled browser's system libs).
  const errors = [];
  for (const [label, launch] of strategies) {
    try {
      browser = await launch();
      break;
    } catch (err) {
      errors.push(`${label}: ${err?.message ?? err}`);
    }
  }
  if (!browser) {
    server.close();
    skip('Could not launch a browser', [
      'To enable on this host: `npx playwright install --only-shell chromium`.',
      ...errors,
    ]);
    return;
  }

  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
    // let the intro curtain lift (instant under reduced motion) and content settle
    await page.waitForSelector('#main', { state: 'attached', timeout: 15000 });
    await page.waitForSelector('[aria-label="Site intro"]', { state: 'detached', timeout: 15000 }).catch(() => {});
    if (page.evaluate) await page.evaluate(() => document.fonts?.ready).catch(() => {});
    await page.waitForTimeout(400);

    const html = await page.content();
    await writeFile(join(DIST, 'index.html'), html, 'utf8');
    console.log('[prerender] Wrote prerendered dist/index.html');
  } finally {
    await browser.close();
    server.close();
  }
}


main().catch((err) => {
  skip(`Error: ${err?.message ?? err}`);
  process.exit();
});
