#!/usr/bin/env node
// Audit des attributs alt sur les balises <img> de tous les fichiers HTML.
//
// Classifications :
//  - MISSING : balise <img> sans attribut alt du tout.
//  - EMPTY   : alt="" — acceptable pour image décorative, mais à vérifier.
//  - OK      : alt avec contenu non vide.
//
// Usage : node scripts/audit-alt.mjs [--verbose] [--include-mockups]

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve, relative, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const VERBOSE = process.argv.includes('--verbose');
const INCLUDE_MOCKUPS = process.argv.includes('--include-mockups');

const RED = '\x1b[31m';
const ORANGE = '\x1b[33m';
const GREEN = '\x1b[32m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

const SKIP_DIRS = new Set(['node_modules', '.git', '.claude', 'preview']);
if (!INCLUDE_MOCKUPS) SKIP_DIRS.add('mockups');

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('.')) continue;
    if (SKIP_DIRS.has(entry)) continue;
    const full = resolve(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      files.push(...walk(full));
    } else if (entry.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

// Extrait toutes les balises <img ...> (auto-closing ou non).
// Retourne {raw, alt, hasAlt, lineNumber}.
function extractImgs(html) {
  const lines = html.split('\n');
  const imgs = [];
  const re = /<img\b([^>]*?)\/?>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const raw = m[0];
    const attrs = m[1];
    // chercher alt="..." ou alt='...'
    const altMatch = attrs.match(/\balt\s*=\s*(["'])([\s\S]*?)\1/i);
    let hasAlt = !!altMatch;
    let alt = altMatch ? altMatch[2] : null;
    // Trouver la ligne approximative
    const lineNumber = html.slice(0, m.index).split('\n').length;
    imgs.push({ raw, hasAlt, alt, lineNumber });
  }
  return imgs;
}

const htmlFiles = walk(ROOT).sort();

let totalImgs = 0;
let missing = 0;
let empty = 0;
let ok = 0;
const issues = [];

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const imgs = extractImgs(html);
  for (const img of imgs) {
    totalImgs++;
    if (!img.hasAlt) {
      missing++;
      issues.push({ file, type: 'MISSING', img });
    } else if (img.alt === '' || img.alt.trim() === '') {
      empty++;
      if (VERBOSE) issues.push({ file, type: 'EMPTY', img });
    } else {
      ok++;
    }
  }
}

console.log(`\n${DIM}Audit alt — ${htmlFiles.length} fichiers HTML${RESET}`);
if (!INCLUDE_MOCKUPS) {
  console.log(`${DIM}(mockups/ et preview/ exclus — lancer avec --include-mockups pour les inclure)${RESET}`);
}
console.log('');

console.log(`Balises <img> scannées    : ${totalImgs}`);
console.log(`  ${GREEN}OK${RESET}     (alt non vide)    : ${ok}`);
console.log(`  ${ORANGE}EMPTY${RESET}  (alt="")          : ${empty}`);
console.log(`  ${RED}MISSING${RESET} (aucun alt)       : ${missing}`);

if (issues.length === 0) {
  console.log(`\n${GREEN}Aucun problème détecté.${RESET}\n`);
  process.exit(0);
}

console.log(`\n${DIM}Détail${RESET} :`);
const byFile = new Map();
for (const it of issues) {
  if (!byFile.has(it.file)) byFile.set(it.file, []);
  byFile.get(it.file).push(it);
}
for (const [file, items] of byFile) {
  const rel = relative(ROOT, file).split(sep).join('/');
  console.log(`\n  ${rel}`);
  for (const it of items) {
    const color = it.type === 'MISSING' ? RED : ORANGE;
    const snippet = it.img.raw.length > 100 ? it.img.raw.slice(0, 100) + '…' : it.img.raw;
    console.log(`    ${color}[${it.type}]${RESET} L${it.img.lineNumber}  ${snippet}`);
  }
}
console.log('');

process.exit(missing > 0 ? 1 : 0);
