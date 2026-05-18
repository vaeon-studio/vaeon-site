#!/usr/bin/env node
// Audit JSON-LD sur toutes les pages HTML indexées dans sitemap.xml.
// - Parse chaque bloc <script type="application/ld+json">
// - Vérifie : syntaxe JSON valide, propriétés requises par type, pas de placeholder
//
// Usage : node scripts/audit-jsonld.mjs [--verbose]

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

// Propriétés requises (recommandées) par type Schema.org pour un rich snippet correct.
const REQUIRED = {
  Organization: ['name', 'url'],
  WebSite: ['name', 'url'],
  WebPage: ['name'],
  Service: ['name', 'provider'],
  ProfessionalService: ['name', 'url'],
  FAQPage: ['mainEntity'],
  Question: ['name', 'acceptedAnswer'],
  Answer: ['text'],
  BreadcrumbList: ['itemListElement'],
  ListItem: ['position', 'name'],
  BlogPosting: ['headline', 'author', 'datePublished'],
  Person: ['name'],
  PostalAddress: ['addressCountry'],
  Offer: ['price', 'priceCurrency'],
  AggregateOffer: ['lowPrice', 'highPrice', 'priceCurrency'],
};

const PLACEHOLDERS = [
  /example\.com/i,
  /lorem ipsum/i,
  /\bTODO\b/,
  /\bFIXME\b/,
  /XXX+/,
  /placeholder/i,
];

function urlToFile(url) {
  let rel = url.replace(SITE_ORIGIN, '').replace(/^\//, '');
  if (rel === '' || rel.endsWith('/')) rel += 'index.html';
  return resolve(ROOT, rel);
}

function extractLdBlocks(html) {
  const blocks = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    blocks.push(m[1].trim());
  }
  return blocks;
}

function checkPlaceholders(raw) {
  return PLACEHOLDERS.filter((re) => re.test(raw)).map((re) => re.source);
}

function walkNodes(node, cb, path = '$') {
  if (Array.isArray(node)) {
    node.forEach((n, i) => walkNodes(n, cb, `${path}[${i}]`));
  } else if (node && typeof node === 'object') {
    cb(node, path);
    for (const [k, v] of Object.entries(node)) {
      walkNodes(v, cb, `${path}.${k}`);
    }
  }
}

function checkRequiredProps(parsed) {
  const issues = [];
  walkNodes(parsed, (node, path) => {
    if (typeof node['@type'] !== 'string') return;
    const type = node['@type'];
    const required = REQUIRED[type];
    if (!required) return;
    for (const prop of required) {
      const hasProp = prop in node || `${prop}` in node;
      if (!hasProp) {
        issues.push(`${path} (@type=${type}) : propriété requise manquante "${prop}"`);
      }
    }
  });
  return issues;
}

const sitemap = readFileSync(SITEMAP, 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

let totalBlocks = 0;
let totalSyntaxErrors = 0;
let totalMissingProps = 0;
let totalPlaceholders = 0;
const pageIssues = [];

console.log(`\n${DIM}Audit JSON-LD — ${urls.length} pages${RESET}\n`);

for (const url of urls) {
  const file = urlToFile(url);
  let html;
  try {
    html = readFileSync(file, 'utf8');
  } catch {
    console.log(`${RED}[FICHIER INTROUVABLE]${RESET} ${url}`);
    continue;
  }
  const blocks = extractLdBlocks(html);
  const pageProblems = [];

  blocks.forEach((raw, idx) => {
    totalBlocks++;
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      totalSyntaxErrors++;
      pageProblems.push({ type: 'syntax', idx, msg: err.message });
      return;
    }
    const placeholders = checkPlaceholders(raw);
    if (placeholders.length) {
      totalPlaceholders += placeholders.length;
      pageProblems.push({ type: 'placeholder', idx, msg: placeholders.join(', ') });
    }
    const missing = checkRequiredProps(parsed);
    if (missing.length) {
      totalMissingProps += missing.length;
      pageProblems.push({ type: 'props', idx, msg: missing.join(' | ') });
    }
  });

  if (pageProblems.length === 0) {
    console.log(`${GREEN}OK${RESET}  ${blocks.length} bloc(s)  ${url}`);
  } else {
    pageIssues.push({ url, blocks: blocks.length, problems: pageProblems });
    console.log(`${RED}KO${RESET}  ${blocks.length} bloc(s)  ${url}  ${RED}${pageProblems.length} problème(s)${RESET}`);
    if (VERBOSE) {
      for (const p of pageProblems) {
        console.log(`    ${ORANGE}[bloc #${p.idx} · ${p.type}]${RESET} ${p.msg}`);
      }
    }
  }
}

console.log(`\n${DIM}Bilan${RESET}`);
console.log(`  Blocs JSON-LD scannés     : ${totalBlocks}`);
console.log(`  Erreurs de syntaxe        : ${totalSyntaxErrors === 0 ? GREEN : RED}${totalSyntaxErrors}${RESET}`);
console.log(`  Propriétés requises manqu.: ${totalMissingProps === 0 ? GREEN : RED}${totalMissingProps}${RESET}`);
console.log(`  Placeholders détectés     : ${totalPlaceholders === 0 ? GREEN : RED}${totalPlaceholders}${RESET}`);
console.log(`  Pages avec problème(s)    : ${pageIssues.length === 0 ? GREEN : RED}${pageIssues.length}${RESET} / ${urls.length}\n`);

if (!VERBOSE && pageIssues.length) {
  console.log(`${DIM}Relance avec --verbose pour le détail des problèmes.${RESET}\n`);
}

process.exit(pageIssues.length > 0 ? 1 : 0);
