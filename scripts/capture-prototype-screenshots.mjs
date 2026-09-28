/**
 * Captures the three SIH prototype screens from the running Vite app.
 * Prerequisites: API on :5000 and client on :3000 (npm run dev:server & dev:client).
 */
import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '../client/public/prototype-screenshots');

const shots = [
  {
    file: '01-document-upload-ai-extraction.png',
    url: 'http://localhost:3000/?tab=processing&doc=DOC-MP-2026-001',
    waitMs: 4000,
  },
  {
    file: '02-officer-verification-dashboard.png',
    url: 'http://localhost:3000/?tab=verification&review=1',
    waitMs: 5000,
  },
  {
    file: '03-validation-gis-dashboard.png',
    url: 'http://localhost:3000/?tab=gis',
    waitMs: 2500,
  },
];

async function waitForApi(baseUrl) {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`${baseUrl}/api/health`);
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error('API not reachable at http://localhost:5000 — start npm run dev:server first.');
}

await mkdir(outDir, { recursive: true });
await waitForApi('http://localhost:5000');

// Set PLAYWRIGHT_EXECUTABLE_PATH when using a system browser instead of the
// Chromium build managed by Playwright (useful in pre-provisioned environments).
const browser = await chromium.launch({
  ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH
    ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
    : {}),
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();

for (const shot of shots) {
  console.log(`Capturing ${shot.file}…`);
  await page.goto(shot.url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(shot.waitMs);
  await page.screenshot({
    path: path.join(outDir, shot.file),
    fullPage: false,
  });
}

await browser.close();
console.log(`Done. Screenshots saved to client/public/prototype-screenshots/`);
