#!/usr/bin/env node
// Audit hiérarchie des titres sur toutes les pages HTML indexées dans sitemap.xml.
//
// Règles vérifiées :
//  - Exactement 1 <h1> par page.
//  - Pas de saut hiérarchique (h2 → h4 sans h3 intermédiaire).
//  - h1 doit être le premier titre rencontré (sinon warning).
//
// Usage : node scripts/audit-headings.mjs [--verbose]

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SITEMAP = resolve(ROOT, 'sitemap.xml');
const SITE_ORIGIN = 'https://vaeon.fr';
const VERBOSE = process.argv.includes('--verbose');

const RED = '\x1b[31m';
const ORANGE = '\x1b[33m';
const GREEN = '\x1b[32m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

function urlToFile(url) {
  let rel = url.replace(SITE_ORIGIN, '').replace(/^\//, '');
  if (rel === '' || rel.endsWith('/')) rel += 'index.html';
  return resolve(ROOT, rel);
}

function extractHeadings(html) {
  // Capture h1-h6 dans l'ordre d'apparition + texte interne (premier 60 chars).
  // Skippe ce qui est dans <script>/<style>/commentaires.
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  const re = /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
  const headings = [];
  let m;
  while ((m = re.exec(cleaned)) !== null) {
    const level = parseInt(m[1], 10);
    const text = m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    const lineNumber = cleaned.slice(0, m.index).split('\n').length;
    headings.push({ level, text: text.slice(0, 80), lineNumber });
  }
  return headings;
}

function analyze(headings) {
  const issues = [];
  const h1Count = headings.filter((h) => h.level === 1).length;
  if (h1Count === 0) issues.push({ type: 'NO_H1', msg: 'aucun <h1>' });
  if (h1Count > 1) issues.push({ type: 'MULTI_H1', msg: `${h1Count} <h1> trouvés` });

  for (let i = 1; i < headings.length; i++) {
    const prev = headings[i - 1];
    const cur = headings[i];
    if (cur.level - prev.level > 1) {
      issues.push({
        type: 'JUMP',
        msg: `saut h${prev.level} → h${cur.level} : "${prev.text}" → "${cur.text}"`,
        line: cur.lineNumber,
      });
    }
  }

  if (headings.length && headings[0].level !== 1) {
    issues.push({
      type: 'H1_NOT_FIRST',
      msg: `le premier titre est h${headings[0].level}, devrait être h1`,
    });
  }
  return issues;
}

const sitemap = readFileSync(SITEMAP, 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

let pagesWithIssues = 0;
let totalIssues = 0;

console.log(`\n${DIM}Audit hiérarchie titres — ${urls.length} pages${RESET}\n`);

for (const url of urls) {
  const file = urlToFile(url);
  let html;
  try {
    html = readFileSync(file, 'utf8');
  } catch {
    console.log(`${RED}[FICHIER INTROUVABLE]${RESET} ${url}`);
    continue;
  }
  const headings = extractHeadings(html);
  const issues = analyze(headings);
  if (issues.length === 0) {
    if (VERBOSE) {
      const seq = headings.map((h) => `h${h.level}`).join(' › ');
      console.log(`${GREEN}OK${RESET}  ${url}  ${DIM}(${seq})${RESET}`);
    } else {
      console.log(`${GREEN}OK${RESET}  ${url}`);
    }
    continue;
  }
  pagesWithIssues++;
  totalIssues += issues.length;
  console.log(`${RED}KO${RESET}  ${url}  ${RED}${issues.length} problème(s)${RESET}`);
  for (const it of issues) {
    console.log(`    ${ORANGE}[${it.type}]${RESET} ${it.msg}${it.line ? `  ${DIM}L${it.line}${RESET}` : ''}`);
  }
  if (VERBOSE) {
    console.log(`    ${DIM}Séquence complète : ${headings.map((h) => `h${h.level}`).join(' › ')}${RESET}`);
  }
}

console.log(`\n${DIM}Bilan${RESET}`);
console.log(`  Pages avec problème(s)  : ${pagesWithIssues === 0 ? GREEN : RED}${pagesWithIssues}${RESET} / ${urls.length}`);
console.log(`  Total issues            : ${totalIssues === 0 ? GREEN : RED}${totalIssues}${RESET}\n`);

process.exit(pagesWithIssues > 0 ? 1 : 0);
