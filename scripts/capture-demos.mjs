// Capture screenshots of the 6 demo landing pages for use in barber/beaute cards.
//
// Prérequis :
//   1. Serveur HTTP local actif sur http://localhost:3001 (npx http-server . -p 3001)
//   2. Puppeteer installé (ad-hoc, ne pas committer node_modules) :
//        npm install puppeteer --no-save
//
// Usage : node scripts/capture-demos.mjs
//
// Sortie : 6 WebP dans barber/assets/ et beaute/assets/ (3 chacun).
// Les images sont versionnées dans le repo — relancer uniquement après modif des démos.

import puppeteer from 'puppeteer';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const BASE = 'http://localhost:3001';

// 4:5 portrait viewport (matches .preview-frame CSS aspect-ratio).
// Capture at 2x for retina sharpness.
const VIEWPORT = { width: 1440, height: 1800, deviceScaleFactor: 1 };

const TARGETS = [
  { url: '/demo/barber/essentielle/',  out: 'barber/assets/preview-essentielle.webp' },
  { url: '/demo/barber/signature/',    out: 'barber/assets/preview-signature.webp' },
  { url: '/demo/barber/iconique/',     out: 'barber/assets/preview-iconique.webp' },
  { url: '/demo/beaute/essentielle/',  out: 'beaute/assets/preview-essentielle.webp' },
  { url: '/demo/beaute/signature/',    out: 'beaute/assets/preview-signature.webp' },
  { url: '/demo/beaute/iconique/',     out: 'beaute/assets/preview-iconique.webp' },
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  try {
    for (const { url, out } of TARGETS) {
      const fullUrl = BASE + url;
      console.log(`→ ${fullUrl}`);
      const page = await browser.newPage();
      await page.setViewport(VIEWPORT);
      await page.goto(fullUrl, { waitUntil: 'networkidle0', timeout: 30000 });
      // Extra delay for late animations / lazy images.
      await sleep(2000);
      const fullPath = join(REPO_ROOT, out);
      mkdirSync(dirname(fullPath), { recursive: true });
      await page.screenshot({
        path: fullPath,
        type: 'webp',
        quality: 82,
        // Capture only the viewport (1440x1800), not full page — we want the hero view only.
        fullPage: false,
      });
      await page.close();
      console.log(`  ✓ saved ${out}`);
    }
  } finally {
    await browser.close();
  }
  console.log('Done.');
})();
