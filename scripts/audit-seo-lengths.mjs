#!/usr/bin/env node
// Audit longueur <title> et <meta name="description"> sur toutes les pages HTML
// indexées dans sitemap.xml. Compte en code points (Unicode-aware).
//
// Usage : node scripts/audit-seo-lengths.mjs

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SITEMAP = resolve(ROOT, 'sitemap.xml');
const SITE_ORIGIN = 'https://vaeon.fr';

const TITLE_MIN = 30;
const TITLE_MAX = 60;
const DESC_MIN = 110;
const DESC_MAX = 155;

const RED = '\x1b[31m';
const ORANGE = '\x1b[33m';
const GREEN = '\x1b[32m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

function len(str) {
  return [...str].length;
}

function decodeHtml(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function extractTitle(html) {
  // Le contenu <title> ne peut pas contenir < ou >, donc pas de risque d'apostrophe.
  const m = html.match(/<title>([\s\S]*?)<\/title>/i);
  return m ? decodeHtml(m[1].trim()) : null;
}

function extractDescription(html) {
  // Capture le délimiteur (quote ou apostrophe) puis tout jusqu'au même délimiteur.
  // Évite de stopper sur une apostrophe interne (ex: "d'avocats").
  const m = html.match(/<meta\s+name=["']description["']\s+content=(["'])([\s\S]*?)\1/i);
  return m ? decodeHtml(m[2].trim()) : null;
}

function urlToFile(url) {
  let rel = url.replace(SITE_ORIGIN, '').replace(/^\//, '');
  if (rel === '' || rel.endsWith('/')) rel += 'index.html';
  return resolve(ROOT, rel);
}

function severity(value, min, max) {
  if (value === null) return 'missing';
  if (value > max) return 'over';
  if (value < min) return 'under';
  return 'ok';
}

function color(sev) {
  if (sev === 'over' || sev === 'missing') return RED;
  if (sev === 'under') return ORANGE;
  return GREEN;
}

function badge(sev) {
  if (sev === 'over') return 'TROP LONG';
  if (sev === 'under') return 'TROP COURT';
  if (sev === 'missing') return 'MANQUANT';
  return 'OK';
}

const sitemap = readFileSync(SITEMAP, 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

const rows = [];
for (const url of urls) {
  const file = urlToFile(url);
  let html;
  try {
    html = readFileSync(file, 'utf8');
  } catch {
    rows.push({ url, file, error: 'FICHIER INTROUVABLE' });
    continue;
  }
  const title = extractTitle(html);
  const desc = extractDescription(html);
  rows.push({
    url,
    file,
    title,
    titleLen: title === null ? null : len(title),
    titleSev: severity(title === null ? null : len(title), TITLE_MIN, TITLE_MAX),
    desc,
    descLen: desc === null ? null : len(desc),
    descSev: severity(desc === null ? null : len(desc), DESC_MIN, DESC_MAX),
  });
}

const SEV_ORDER = { over: 0, missing: 1, under: 2, ok: 3 };
rows.sort((a, b) => {
  const aSev = Math.min(SEV_ORDER[a.titleSev] ?? 3, SEV_ORDER[a.descSev] ?? 3);
  const bSev = Math.min(SEV_ORDER[b.titleSev] ?? 3, SEV_ORDER[b.descSev] ?? 3);
  if (aSev !== bSev) return aSev - bSev;
  return a.url.localeCompare(b.url);
});

console.log(`\n${DIM}Audit longueur SEO — ${rows.length} pages — seuils: title ${TITLE_MIN}-${TITLE_MAX}, desc ${DESC_MIN}-${DESC_MAX}${RESET}\n`);

let issues = 0;
for (const r of rows) {
  if (r.error) {
    console.log(`${RED}[${r.error}]${RESET} ${r.url}`);
    issues++;
    continue;
  }
  const tColor = color(r.titleSev);
  const dColor = color(r.descSev);
  const tBadge = `${tColor}${String(r.titleLen ?? '—').padStart(3)} ${badge(r.titleSev).padEnd(10)}${RESET}`;
  const dBadge = `${dColor}${String(r.descLen ?? '—').padStart(3)} ${badge(r.descSev).padEnd(10)}${RESET}`;
  console.log(`${tBadge}  ${dBadge}  ${r.url}`);
  if (r.titleSev !== 'ok' || r.descSev !== 'ok') issues++;
}

console.log(`\n${DIM}Légende${RESET}: ${GREEN}OK${RESET} dans la fenêtre | ${ORANGE}TROP COURT${RESET} sous le min | ${RED}TROP LONG / MANQUANT${RESET} hors limite`);
console.log(`\n${issues === 0 ? GREEN : RED}${issues}${RESET} ligne(s) à corriger sur ${rows.length} pages.\n`);

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(rows, null, 2));
}

process.exit(issues > 0 ? 1 : 0);
