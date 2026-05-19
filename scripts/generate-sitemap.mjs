#!/usr/bin/env node
// Génère sitemap.xml à partir de tous les fichiers HTML du repo.
//
// Règles :
//  - Scanne récursivement le repo à partir de la racine.
//  - Exclut : 404.html, mockups/, preview/, demo/, pages noindex, dossiers commençant par "."
//  - Pour chaque .html, déduit l'URL canonique :
//      * Lit <link rel="canonical"> si présent (source de vérité)
//      * Sinon : transforme le chemin en URL ; ".../index.html" → ".../"
//  - <lastmod> = date du dernier commit git touchant le fichier (fallback : mtime).
//  - priority / changefreq selon convention (voir PRIORITIES ci-dessous).
//
// Usage : node scripts/generate-sitemap.mjs [--dry-run]

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, relative, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SITE_ORIGIN = 'https://vaeon.fr';
const OUT = resolve(ROOT, 'sitemap.xml');
const DRY = process.argv.includes('--dry-run');

const SKIP_DIRS = new Set(['node_modules', '.git', '.claude', 'mockups', 'preview', 'uploads', 'demo']);
const SKIP_FILES = new Set(['404.html']);

// Convention de priorité / changefreq. Premier pattern qui matche gagne.
const PRIORITIES = [
  { pattern: /^index\.html$/, priority: '1.0', changefreq: 'weekly' },
  { pattern: /^(tarifs|services|projets|contact|process|a-propos|agence-web-toulouse)\.html$/, priority: '0.8', changefreq: 'monthly' },
  { pattern: /^(essentielle|signature|iconique)\.html$/, priority: '0.7', changefreq: 'monthly' },
  { pattern: /^metiers\/index\.html$/, priority: '0.8', changefreq: 'monthly' },
  { pattern: /^metiers\/[^/]+\/index\.html$/, priority: '0.6', changefreq: 'monthly' },
  { pattern: /^blog\/index\.html$/, priority: '0.7', changefreq: 'weekly' },
  { pattern: /^blog\/[^/]+\/index\.html$/, priority: '0.6', changefreq: 'monthly' },
  { pattern: /^(mentions-legales|politique-confidentialite|cookies)\.html$/, priority: '0.3', changefreq: 'yearly' },
];

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('.')) continue;
    if (SKIP_DIRS.has(entry)) continue;
    const full = resolve(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      files.push(...walk(full));
    } else if (entry.endsWith('.html') && !SKIP_FILES.has(entry)) {
      files.push(full);
    }
  }
  return files;
}

function extractCanonical(html) {
  const m = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

function isNoIndex(html) {
  // Page marquée <meta name="robots" content="noindex,..."> → hors sitemap.
  // Utile pour les landings de démarchage commercial (ex : /barber/, /beaute/)
  // qui doivent rester accessibles par URL directe mais hors index Google.
  const m = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i);
  return m ? /\bnoindex\b/i.test(m[1]) : false;
}

function pathToUrl(relPath) {
  // relPath uses OS sep — normalize to /
  const norm = relPath.split(sep).join('/');
  if (norm === 'index.html') return SITE_ORIGIN + '/';
  if (norm.endsWith('/index.html')) return SITE_ORIGIN + '/' + norm.slice(0, -'index.html'.length);
  return SITE_ORIGIN + '/' + norm;
}

function gitLastMod(file) {
  try {
    const iso = execSync(`git log -1 --format=%cI -- "${file}"`, { cwd: ROOT, encoding: 'utf8' }).trim();
    if (iso) return iso.slice(0, 10); // YYYY-MM-DD
  } catch {
    /* fallback below */
  }
  const st = statSync(file);
  return st.mtime.toISOString().slice(0, 10);
}

function classify(relPath) {
  const norm = relPath.split(sep).join('/');
  for (const rule of PRIORITIES) {
    if (rule.pattern.test(norm)) return rule;
  }
  return { priority: '0.5', changefreq: 'monthly' };
}

const htmlFiles = walk(ROOT);
const entries = [];

const excluded = [];
for (const file of htmlFiles) {
  const rel = relative(ROOT, file);
  const html = readFileSync(file, 'utf8');
  if (isNoIndex(html)) { excluded.push(rel); continue; }
  const canonical = extractCanonical(html);
  const url = canonical || pathToUrl(rel);
  const lastmod = gitLastMod(file);
  const { priority, changefreq } = classify(rel);
  entries.push({ rel, url, lastmod, priority, changefreq });
}

// Tri stable : accueil d'abord, puis ordre alpha des URLs.
entries.sort((a, b) => {
  if (a.url === SITE_ORIGIN + '/') return -1;
  if (b.url === SITE_ORIGIN + '/') return 1;
  return a.url.localeCompare(b.url);
});

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...entries.map((e) => [
    '  <url>',
    `    <loc>${e.url}</loc>`,
    `    <lastmod>${e.lastmod}</lastmod>`,
    `    <changefreq>${e.changefreq}</changefreq>`,
    `    <priority>${e.priority}</priority>`,
    '  </url>',
  ].join('\n')),
  '</urlset>',
  '',
].join('\n');

if (DRY) {
  process.stdout.write(xml);
  console.error(`\n[dry-run] ${entries.length} URL(s) — pas d'écriture.`);
  process.exit(0);
}

writeFileSync(OUT, xml, 'utf8');
console.log(`✓ sitemap.xml généré — ${entries.length} URL(s) — ${relative(ROOT, OUT)}`);
if (excluded.length) {
  console.log(`  (${excluded.length} page(s) noindex exclue(s) : ${excluded.join(', ')})`);
}
