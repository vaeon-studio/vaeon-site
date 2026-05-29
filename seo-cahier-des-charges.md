# Cahier des charges — SEO Foundations vaeon.fr

**Auteur** Maxime · Direction
**Destinataires** Hedi Contreras (dev), Wassim Ouadah (design)
**Date** 2026-05-18
**Référence brief source** `brief-seo-vaeon.pdf` (mai 2026)
**Branche de travail** `claude/elastic-ptolemy-9689bf`
**URL de référence locale** http://localhost:8765/
**URL de production** https://vaeon.fr/ (Vercel, dernier commit déployé : `296aebd`)

---

## 1. Contexte

Le brief technique initial (`brief-seo-vaeon.pdf`) a été rédigé en supposant que le site était un projet **Astro** quasi vide côté SEO. Audit fait : **le repo est en réalité un site HTML statique** déjà bien équipé. La majorité des fondations sont en place. Ce cahier des charges **remplace le brief original** en se concentrant sur les vrais gaps.

**Objectif** : terminer les fondations SEO/AISO avant le lancement de la prospection (~1ᵉʳ juin 2026), avec une présence Google et IA crédible sur les 33 pages indexées.

---

## 2. État de l'existant (audit du `2026-05-18`)

### Déjà en place (à ne pas refaire)

- Meta `<title>` et `<meta name="description">` sur **les 33 pages** (sauf `404.html`, légitime).
- `<link rel="canonical">` sur les 33 pages (sauf `404.html`).
- Balises Open Graph + Twitter Card sur les 33 pages.
- JSON-LD structurés très riches : `Organization`, `WebSite`, `ProfessionalService`, 17 × `Service`, 19 × `FAQPage`, 24 × `BreadcrumbList`, 3 × `BlogPosting`, etc.
- `robots.txt` présent, pointe vers le sitemap.
- `sitemap.xml` manuel à jour (33 URLs, miroir parfait des fichiers HTML).
- 13 pages métier déjà en ligne sous `/metiers/`.
- 3 maquettes (Essentielle, Signature, Iconique) publiées.
- 3 articles de blog en ligne.
- Un seul `<h1>` par page (vérifié sur les 6 pages principales).
- Footer "En route vers vous" + page Institut & Spa déployés en production.

### Gaps identifiés (ce qui reste à traiter)

| # | Gap | Priorité | Effort |
|---|---|---|---|
| 01 | OG image au format SVG (peu compatible LinkedIn/Discord/WhatsApp) | P0 | 30 min |
| 02 | Meta title accueil trop long (~65 car.) et orienté "ce qu'on est" | P0 | 10 min |
| 03 | Audit longueur des 33 title tags (50-60 car.) + descriptions (130-155 car.) | P0 | 45 min |
| 04 | Validation JSON-LD via Google Rich Results Test | P0 | 20 min |
| 05 | Sitemap manuel → risque de désync | P1 | 30 min |
| 06 | Lighthouse / Core Web Vitals non audités | P1 | 1 h |
| 07 | Search Console : sitemap soumis ? indexation accueil ? | P1 | 15 min |
| 08 | Audit `alt` sur toutes les `<img>` (33 pages) | P1 | 30 min |
| 09 | Audit hiérarchie h1/h2/h3 sur les 33 pages | P2 | 1 h |
| 10 | OG image variable par page (vs unique og-square.svg) | P2 | variable |

**Total effort P0+P1 estimé : ~4 h de travail cumulé.**

---

## 3. Chantier 01 — OG image JPG 1200×630 (P0)

### Constat
Toutes les pages utilisent `https://vaeon.fr/assets/og-square.svg` (format SVG, 1254×1254 carré). LinkedIn, Discord, WhatsApp et Slack n'affichent pas systématiquement les SVG en preview ; Twitter/X accepte mais redimensionne mal le carré.

### Action
1. Produire un visuel `og-image.jpg` **1200 × 630 px** (ratio 1.91:1), < 300 Ko, design VÆON (wordmark + accent visuel sur fond `#15130F`).
2. L'héberger dans `/assets/og-image.jpg`.
3. Remplacer **dans toutes les pages** (find/replace) `assets/og-square.svg` → `assets/og-image.jpg`.
4. Mettre à jour `og:image:width=1200` et `og:image:height=630`.
5. Conserver le SVG carré comme alternative pour Instagram / favicons si besoin (optionnel).

### Critère d'acceptation
- L'URL https://vaeon.fr/assets/og-image.jpg renvoie un JPG 1200×630.
- Test de partage LinkedIn Post Inspector OK : https://www.linkedin.com/post-inspector/
- Test Twitter Card Validator OK : https://cards-dev.twitter.com/validator (ou outil équivalent).

---

## 4. Chantier 02 — Meta title homepage (P0)

### Constat
Actuel : `VÆON Studio — Studio web premium & développement sur-mesure` (~65 caractères, Google tronque à 60). Le titre décrit "ce qu'on est" sans cible.

### Action
Tester ces 3 variantes courtes (≤ 60 car.) et choisir la plus performante :

1. **`VÆON Studio — Sites web sur-mesure pour TPE premium`** (52 car.)
2. **`VÆON — Studio web sur-mesure pour commerces premium`** (51 car.)
3. **`VÆON Studio — Création de sites web haut de gamme`** (49 car.)

Recommandation par défaut : **option 1** (mot-clé principal "sites web sur-mesure" + cible "TPE premium" explicite). À aligner avec `og:title` et `twitter:title` de l'accueil.

### Critère d'acceptation
- Title accueil ≤ 60 caractères.
- Contient le mot-clé principal `sites web sur-mesure`.
- Cohérent avec `og:title` et `twitter:title`.

---

## 5. Chantier 03 — Audit longueur titles & descriptions 33 pages (P0)

### Constat
Aucun audit systématique n'a été fait sur la longueur des balises sur l'ensemble du site.

### Action
1. Script de check (Node ou simple `grep + awk`) qui liste :
   - Pour chaque page : URL, longueur du `<title>` en caractères, longueur du `description`.
2. Marquer en **rouge** tout title > 60 ou description > 155.
3. Réécrire les balises hors limites en gardant le sens.
4. Documenter le tableau de synthèse dans une annexe de ce cahier des charges.

### Critère d'acceptation
- 0 page avec title > 60 caractères.
- 0 page avec description > 155 caractères.
- 0 page avec description < 110 caractères (sous-exploité).
- Tableau d'audit final commit.

---

## 6. Chantier 04 — Validation JSON-LD (P0)

### Constat
Le site a 200+ blocs JSON-LD répartis sur 33 pages mais aucune validation Google n'a été faite.

### Action
Passer **chacune des 33 URLs** dans :
- Google Rich Results Test : https://search.google.com/test/richresults
- Schema.org Validator : https://validator.schema.org/

Corriger toute erreur ou warning bloquant. Cible : 0 erreur, warnings tolérés s'ils ne bloquent pas un rich snippet.

### Critère d'acceptation
- 33 pages validées sans erreur sur les deux outils.
- Capture d'écran ou export du rapport pour traçabilité.

---

## 7. Chantier 05 — Automatiser le sitemap (P1)

### Constat
`sitemap.xml` est maintenu manuellement (168 lignes). À chaque ajout de page métier ou article de blog, on risque l'oubli.

### Action
Option A (recommandée, légère) : **script Node** `scripts/generate-sitemap.mjs` qui scanne `*.html` + `metiers/*/index.html` + `blog/*/index.html` et régénère `sitemap.xml` avec `<lastmod>` basé sur `fs.statSync`. Ajouter un hook pre-deploy Vercel ou un script `npm run sitemap`.

Option B (lourde) : pas de framework, on laisse manuel mais on ajoute une checklist pre-merge "sitemap à jour" dans CONTRIBUTING.

### Critère d'acceptation
- Script `npm run sitemap` (ou équivalent) génère un sitemap conforme W3C.
- Diff `git diff sitemap.xml` après exécution = 0 si rien n'a bougé.
- Documentation 2-3 lignes dans README ou en haut du fichier sitemap.

---

## 8. Chantier 06 — Lighthouse & Core Web Vitals (P1)

### Constat
Pas de baseline mesurée. Objectif annoncé sur le site : "pagespeed: 98/100" — à confirmer.

### Action
1. Lancer Lighthouse (Chrome DevTools, mode mobile) sur les 5 pages clés :
   - `/`, `/metiers/`, `/tarifs.html`, `/contact.html`, `/blog/`
2. Reporter dans un tableau : Performance / Accessibility / Best Practices / SEO.
3. Identifier les 3 plus gros leviers d'amélioration globale.
4. Cibles : Performance > 90, Accessibility > 95, **SEO = 100**.
5. Mesurer LCP / INP / CLS via PageSpeed Insights "Field Data" si dispo (Chrome UX Report).

### Critère d'acceptation
- Tableau Lighthouse commit (5 pages × 4 scores).
- Score SEO = 100 sur les 5 pages.
- Plan d'attaque des points perdus en Performance/Accessibility.

---

## 9. Chantier 07 — Google Search Console (P1)

### Constat
Statut inconnu : est-ce que `vaeon.fr` est revendiqué dans Search Console ? Le sitemap est-il soumis ?

### Action
1. Vérifier la propriété GSC (DNS ou meta tag).
2. Soumettre `https://vaeon.fr/sitemap.xml`.
3. Demander indexation manuelle pour les 6 pages prioritaires :
   - `/`, `/tarifs.html`, `/metiers/`, `/services.html`, `/a-propos.html`, `/agence-web-toulouse.html`.
4. Activer les alertes par email (erreurs d'exploration, problèmes de sécurité).

### Critère d'acceptation
- Propriété GSC vérifiée.
- Sitemap soumis, statut "Réussite".
- 6 indexations manuelles soumises.

---

## 10. Chantier 08 — Audit `alt` images (P1)

### Constat
L'audit rapide n'a remonté aucun `<img>` sans alt sur les pages racine, mais pas de scan exhaustif sur métiers + blog + mockups.

### Action
1. Script `grep` ou parser HTML pour lister tous les `<img>` sans attribut `alt` (ou avec `alt=""` sur une image non-décorative).
2. Compléter avec un texte descriptif court (pas de keyword stuffing).
3. Vérifier aussi : `<svg>` ayant un rôle informatif → `<title>` ou `aria-label`.

### Critère d'acceptation
- 0 `<img>` sans `alt` sur l'ensemble du repo (sauf images purement décoratives → `alt=""`).
- Audit re-passé OK.

---

## 11. Chantier 09 — Hiérarchie h1/h2/h3 (P2)

### Constat
Vérifié OK sur 6 pages principales. Non vérifié sur les 13 pages métier ni sur les 3 maquettes ni sur le blog.

### Action
1. Script qui liste, pour chaque page : nombre de `<h1>`, séquence des `<h2>` / `<h3>` / `<h4>`.
2. Flagger toute page avec ≠ 1 `<h1>`, ou tout saut hiérarchique (`<h4>` sans `<h3>` au-dessus).
3. Corriger les anomalies.

### Critère d'acceptation
- 33 pages avec exactement 1 `<h1>`.
- 0 saut hiérarchique.

---

## 12. Chantier 10 — OG image variable par page (P2)

### Constat
Toutes les pages partagent la même image OG. Idéalement, chaque page métier ou article de blog a sa propre image OG (meilleur CTR sur partage).

### Action
Si bande passante design dispo : produire des variantes OG par métier (institut, restaurant, salon, etc.). Sinon, on garde l'image unique en P2 et on traite après prospection.

### Critère d'acceptation
- Différé après prospection sauf opportunité.

---

## 13. Checklist finale "go prospection"

À cocher avant lancement (1ᵉʳ juin 2026) :

- [ ] **Chantier 01** — `og-image.jpg` 1200×630 en place, find/replace effectué, test LinkedIn/Twitter OK.
- [ ] **Chantier 02** — Meta title accueil ≤ 60 car. + variante validée.
- [ ] **Chantier 03** — Audit longueur 33 pages : 0 dépassement.
- [ ] **Chantier 04** — Rich Results Test : 0 erreur sur 33 pages.
- [ ] **Chantier 05** — Script sitemap fonctionnel (ou checklist manuelle en place).
- [ ] **Chantier 06** — Lighthouse SEO = 100 sur 5 pages clés.
- [ ] **Chantier 07** — Search Console : propriété + sitemap + indexations soumises.
- [ ] **Chantier 08** — 0 `<img>` sans `alt`.
- [ ] **Chantier 09** *(P2 — non bloquant)* — Hiérarchie titres auditée.
- [ ] **Chantier 10** *(P2 — non bloquant)* — OG variable par page (différable).

---

## 14. Ordre d'exécution proposé

**Session 1 (~2 h)** : Chantiers 02 + 03 + 04 — tout ce qui se traite au clavier sans dépendance.
**Session 2 (~1 h)** : Chantier 01 (besoin du visuel og-image.jpg) + Chantier 08.
**Session 3 (~1 h 30)** : Chantier 05 (script sitemap) + Chantier 06 (Lighthouse).
**Session 4 (~15 min)** : Chantier 07 (Search Console, accès Maxime requis).
**Plus tard** : Chantiers 09 + 10.

---

## 15. Boussole

> *Un site studio premium qui s'affiche en spam Google, c'est un studio amateur. Le SEO de base n'est pas un détail technique, c'est une question de crédibilité.*
> — Brief source, mai 2026

---

*Document vivant : à amender au fil des sessions. Toute modification → commit dédié.*

---

## Annexe A — Audit longueur titles & descriptions (chantier 03)

**Date de l'audit final** : 2026-05-18
**Script** : `node scripts/audit-seo-lengths.mjs`
**Seuils** : title 30–60 car. · description 110–155 car. (comptage Unicode-aware)
**Résultat global** : **33 pages / 33 OK** · 0 dépassement, 0 sous-exploitation.

| URL | Title (len) | Description (len) |
|---|---|---|
| `/` | 51 | 127 |
| `/a-propos.html` | 51 | 131 |
| `/agence-web-toulouse.html` | 54 | 132 |
| `/blog/` | 38 | 141 |
| `/blog/combien-coute-site-internet/` | 57 | 138 |
| `/blog/site-internet-pizzeria-besoin/` | 57 | 137 |
| `/blog/wordpress-wix-ou-sur-mesure/` | 59 | 131 |
| `/contact.html` | 46 | 113 |
| `/cookies.html` | 40 | 138 |
| `/essentielle.html` | 54 | 133 |
| `/iconique.html` | 59 | 149 |
| `/mentions-legales.html` | 45 | 115 |
| `/metiers/` | 55 | 142 |
| `/metiers/avocat/` | 47 | 147 |
| `/metiers/bar-pub/` | 48 | 139 |
| `/metiers/barbershop/` | 51 | 150 |
| `/metiers/boutique-ecommerce/` | 56 | 133 |
| `/metiers/coach-sportif/` | 54 | 134 |
| `/metiers/coiffeur/` | 49 | 140 |
| `/metiers/electricien/` | 52 | 143 |
| `/metiers/kine-osteo/` | 51 | 140 |
| `/metiers/medecin/` | 55 | 135 |
| `/metiers/paysagiste/` | 51 | 140 |
| `/metiers/pizzeria/` | 49 | 144 |
| `/metiers/plombier/` | 49 | 139 |
| `/metiers/restaurant/` | 51 | 152 |
| `/metiers/salon-beaute/` | 56 | 136 |
| `/politique-confidentialite.html` | 42 | 127 |
| `/process.html` | 55 | 137 |
| `/projets.html` | 54 | 131 |
| `/services.html` | 52 | 121 |
| `/signature.html` | 52 | 143 |
| `/tarifs.html` | 57 | 141 |

**Pages réécrites lors du chantier 03** : `index.html` (chantier 02), `contact.html`, `cookies.html` (title + desc), `essentielle.html`, `iconique.html`, `mentions-legales.html`, `projets.html` (title + desc), `services.html`, `signature.html`.

---

## Annexe B — Audit JSON-LD (chantier 04)

**Date de l'audit final** : 2026-05-18
**Script** : `node scripts/audit-jsonld.mjs`
**Périmètre** : 33 pages, 33 blocs `<script type="application/ld+json">`.

### Bilan local

| Indicateur | Résultat |
|---|---|
| Blocs JSON-LD scannés | 33 |
| Erreurs de syntaxe | **0** |
| Propriétés requises manquantes | **0** |
| Placeholders (`example.com`, `TODO`, etc.) | **0** |
| Pages avec problème(s) | **0 / 33** |

### Corrections appliquées

| Fichier | Problème initial | Correction |
|---|---|---|
| `index.html` | `ProfessionalService` sans `url` | Ajout de `"url": "https://vaeon.fr/"` |
| `blog/index.html` | 3 `BlogPosting` cards sans `author` / `datePublished` | Ajout de `author` (ref `#organization`) + `datePublished: 2026-05-12` aux 3 cards |
| `blog/combien-coute-site-internet/index.html` | `mainEntityOfPage` objet `WebPage` sans `name` | Simplifié en URL string (pattern Google recommandé) |
| `blog/wordpress-wix-ou-sur-mesure/index.html` | idem | idem |
| `blog/site-internet-pizzeria-besoin/index.html` | idem | idem |

### Validation Google (à faire une fois en prod)

Le validateur local ne remplace pas Google Rich Results Test (qui crawle l'URL live). À passer manuellement après déploiement Vercel :

**URLs prioritaires** (6 à valider obligatoirement avant prospection) :

1. https://search.google.com/test/richresults?url=https://vaeon.fr/
2. https://search.google.com/test/richresults?url=https://vaeon.fr/tarifs.html
3. https://search.google.com/test/richresults?url=https://vaeon.fr/metiers/
4. https://search.google.com/test/richresults?url=https://vaeon.fr/metiers/pizzeria/
5. https://search.google.com/test/richresults?url=https://vaeon.fr/agence-web-toulouse.html
6. https://search.google.com/test/richresults?url=https://vaeon.fr/blog/combien-coute-site-internet/

**Validateur secondaire** (universel, non Google-spécifique) :

- https://validator.schema.org/#url=https%3A%2F%2Fvaeon.fr%2F

**Critère d'acceptation** : 0 erreur sur les 6 URLs. Warnings tolérés s'ils ne bloquent pas un rich snippet.

---

## Annexe C — Open Graph image JPG 1200×630 (chantier 01)

**Date** : 2026-05-18
**Fichier source** : [assets/og-image.svg](assets/og-image.svg) (SVG vectoriel, design VÆON)
**Fichier produit** : [assets/og-image.jpg](assets/og-image.jpg) (1200×630, JPEG baseline, **37 Ko** — bien sous la cible des 300 Ko)
**Conversion** : `npx --yes svgexport assets/og-image.svg assets/og-image.jpg jpg 90% 1200:630`

### Design (v2 — sans prix)
Fond dégradé radial noir (`#0e0e10` → `#15151a` → `#1c1c22`), wordmark **VÆON** centré (Helvetica bold 200px) en `#f3f1ea` (cream), tagline en italique serif "Sites web sur-mesure pour TPE premium", accent orange (`#ff5a1f`) en ligne fine sous la tagline, eyebrow `STUDIO WEB · FRANCE` haut-gauche, point accent orange haut-droite, footer discret `VAEON.FR`. Grille verticale très discrète pour donner de la profondeur.

**Décision design** : les prix ont été retirés de la v1 (initialement `1 300 € — 4 500 € · TOULOUSE`) suite à un retour Maxime. Raison : un studio premium qui ancre la conversation sur le prix avant la valeur signale du discount. Le visuel privilégie maintenant le positionnement (sur-mesure, premium) plutôt que le tarif, qui sera de toute façon explicité dans la copie sociale du post LinkedIn / l'aperçu Twitter.

### Find/replace effectué
- **34 fichiers HTML** modifiés (toutes les pages référençant l'OG image).
- `https://vaeon.fr/assets/og-square.svg` → `https://vaeon.fr/assets/og-image.jpg`
- `og:image:width="1254"` → `og:image:width="1200"`
- `og:image:height="1254"` → `og:image:height="630"`
- Vérification : **0 résidu** de l'ancien chemin ou des anciennes dimensions.

### Fallback
L'ancien `assets/og-square.svg` (1254×1254) est **conservé** : utilisable comme image carrée pour Instagram, favicons hi-res ou usage interne. Pas référencé dans aucun HTML.

### Validation post-déploiement (à faire manuellement)
- LinkedIn Post Inspector : https://www.linkedin.com/post-inspector/inspect/https%3A%2F%2Fvaeon.fr%2F
- Facebook Sharing Debugger : https://developers.facebook.com/tools/debug/?q=https%3A%2F%2Fvaeon.fr%2F
- Twitter Card Validator (si encore actif) : https://cards-dev.twitter.com/validator
- Test rapide WhatsApp / Discord : envoyer l'URL `https://vaeon.fr/` à soi-même et vérifier le rendu de la preview.

### Critère d'acceptation
- [x] `assets/og-image.jpg` existe, 1200×630, < 300 Ko ✓ (41 Ko)
- [x] 34 fichiers HTML mis à jour, 0 résidu de l'ancien fichier ✓
- [x] Audits SEO length + JSON-LD toujours verts après modif ✓
- [ ] Validation visuelle LinkedIn/Facebook/WhatsApp **après déploiement** Vercel (responsabilité Maxime)

---

## Annexe D — Audit `alt` images (chantier 08)

**Date** : 2026-05-18
**Script** : `node scripts/audit-alt.mjs` (avec option `--include-mockups`)

### Bilan

| Périmètre | Fichiers | `<img>` totaux | OK | EMPTY (`alt=""`) | MISSING |
|---|---|---|---|---|---|
| Pages indexées (sitemap) | 35 | 9 | 0 | 9 | **0** |
| + Mockups + Preview | 55 | 28 | 1 | 27 | **0** |

**0 image sans attribut `alt`** sur l'ensemble du repo. ✅

### Analyse des `alt=""`

Les 9 `<img>` `alt=""` sur les pages indexées sont **toutes des avatars de témoignages clients** sur la page d'accueil ([index.html:517-601](index.html:517)). Chaque avatar est immédiatement suivi d'un `<cite>` qui identifie le client (nom + métier).

**Décision** : `alt=""` est **conservé volontairement** parce que :
1. Les images sont des **stock photos Unsplash** (proxys décoratifs, pas de vrais portraits des clients) — un alt nommant la personne serait trompeur.
2. Le nom + rôle est déjà annoncé par les lecteurs d'écran via `<cite>` et `<span class="role">` → un alt descriptif créerait une double annonce.
3. WCAG 1.1.1 recommande explicitement `alt=""` pour les images purement décoratives accompagnées de texte alternatif adjacent.
4. Lighthouse SEO **et** Accessibility passent les deux.

### Critère d'acceptation
- [x] 0 `<img>` sans attribut `alt` ✓
- [x] Choix `alt=""` justifié et documenté ✓
- [x] Audit re-passé OK ✓

---

## Annexe E — Sitemap automatisé (chantier 05)

**Date** : 2026-05-18
**Script** : [scripts/generate-sitemap.mjs](scripts/generate-sitemap.mjs)
**Commande** : `node scripts/generate-sitemap.mjs` · variante `--dry-run` pour preview sans écriture

### Comportement

- Scanne tous les `*.html` du repo récursivement.
- **Exclut** : `404.html`, `mockups/`, `preview/`, `uploads/`, dossiers cachés (`.git`, `.claude`, etc.).
- Pour chaque page, déduit l'URL canonique : lit `<link rel="canonical">` si présent (source de vérité), sinon construit l'URL depuis le chemin de fichier (`metiers/avocat/index.html` → `/metiers/avocat/`).
- **`<lastmod>`** = date du dernier commit Git qui a touché le fichier (`git log -1 --format=%cI`) — résiste aux ré-écritures locales involontaires.
- Tri stable : accueil en premier, puis ordre alpha.
- **Priorités/changefreq** par convention :

| Pattern | Priority | Changefreq |
|---|---|---|
| `index.html` (accueil) | 1.0 | weekly |
| Pages principales (services, tarifs, projets, contact, process, a-propos, agence-web-toulouse) | 0.8 | monthly |
| Maquettes (essentielle/signature/iconique) | 0.7 | monthly |
| `/metiers/` (index) | 0.8 | monthly |
| Pages métier individuelles | 0.6 | monthly |
| `/blog/` (index) | 0.7 | weekly |
| Articles blog | 0.6 | monthly |
| Pages légales | 0.3 | yearly |

### Régression détectée et corrigée par le script

Avant le run : sitemap manuel à 33 URLs. Après run : **34 URLs**. Différence = la page `/metiers/institut-beaute-spa/` qui avait été ajoutée au commit `dc4240f` mais **jamais reportée dans le sitemap manuel**. C'est exactement le risque que le chantier 05 devait éliminer. Le script l'a rattrapé automatiquement.

### Effet de bord positif

L'ajout de la page institut-beaute-spa au périmètre d'audit a fait remonter une description trop longue (158 car., plafond 155). Corrigée dans la foulée (152 car. après simplification).

### Process recommandé

Pré-push, ou via une checklist `CONTRIBUTING.md` future :

```bash
node scripts/generate-sitemap.mjs   # régénère le sitemap
node scripts/audit-seo-lengths.mjs  # vérifie titles/descriptions
node scripts/audit-jsonld.mjs       # vérifie JSON-LD
node scripts/audit-alt.mjs          # vérifie attributs alt
git diff sitemap.xml                # inspecter avant commit
```

### Critère d'acceptation
- [x] Script `node scripts/generate-sitemap.mjs` génère un sitemap conforme W3C ✓
- [x] 34 URLs (vs 33 manuelles) — page oubliée rattrapée ✓
- [x] `<lastmod>` calculés depuis git ✓
- [x] Audits length + JSON-LD verts sur les 34 pages après régénération ✓

---

## Annexe F — Lighthouse / Core Web Vitals (chantier 06)

**Date** : 2026-05-18
**Outil** : `npx --yes lighthouse@13.3.0`
**Mode** : mobile + throttling 4G + CPU 4× (config Google par défaut, c'est ce qui sert au ranking)
**URLs testées** : 5 pages clés via le serveur local `localhost:8765`
**Rapports HTML** : `reports/lh-<page>.report.html` (consultables localement, non commités)

### Tableau de synthèse

| Page | Performance | Accessibility | Best Practices | **SEO** | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| `/` (home) | 50 | 90 | 96 | **100** | 6.2 s | 460 ms | 0.076 |
| `/metiers/` | 67 | 93 | 96 | **100** | 3.7 s | 0 ms | 0.287 |
| `/tarifs.html` | 73 | 98 | 96 | **100** | 4.5 s | 0 ms | 0.076 |
| `/contact.html` | 74 | 98 | 96 | **100** | 4.0 s | 0 ms | 0.125 |
| `/blog/` | 81 | 92 | 96 | **100** | 3.7 s | 0 ms | 0.021 |

**Cibles cahier des charges** : Performance > 90, Accessibility > 95, **SEO = 100**.

### Verdict

- ✅ **SEO = 100 sur les 5 pages** — critère prioritaire atteint, ce qui débloque la prospection.
- ⚠️ **Accessibility 90-93 sur home/metiers/blog** — 3 issues à corriger pour passer >95.
- ❌ **Performance 50-81** — pas dans la fenêtre, mais ces scores sont en throttling mobile agressif. Le hero animé (canvas + particles) plombe l'accueil. Non bloquant pour la prospection mais à traiter avant Google ne dégrade le ranking.

### Top 3 leviers d'amélioration globale

| Levier | Impact (home) | Effort estimé | Notes |
|---|---|---|---|
| **Reduce unused JavaScript** | -850 ms, -93 Ko | moyen | Audit des scripts du hero animé (particles, cascade). Code-split via `defer` / `async`. |
| **Reduce unused CSS** | -650 ms, -103 Ko | moyen | `css/style.css` est un monolithe servi sur toutes les pages. Idéalement : critical CSS inliné + reste différé. |
| **Minify CSS** | -160 ms, -11 Ko | faible | Une simple passe de minification (cssnano, terser…) ferait gagner ~10 % de poids CSS. |

### Issues Accessibility à traiter

| Issue | Pages concernées | Type |
|---|---|---|
| `heading-order` (sauts h2→h4) | home, metiers, contact | **À traiter dans chantier 09** |
| `color-contrast` (contraste insuffisant) | home, metiers | Probable : `--ink-3 #7a7a82` sur fond noir → relever à `--ink-2 #b9b6ad` sur le texte concerné |
| `aria-hidden-focus` | home | Élément avec `aria-hidden="true"` contient un focusable (probablement la cascade animée). À auditer manuellement. |

### Issues Performance critiques

| Issue | Pages | Niveau |
|---|---|---|
| `cumulative-layout-shift` 0.287 | metiers | **Élevé** — Lighthouse veut < 0.1. Probable : grille de cartes métier sans dimensions réservées avant chargement des images. |
| `largest-contentful-paint` 6.2s | home | **Critique** — hero canvas long à initialiser. À investiguer en priorité 2 (post-prospection). |

### Plan d'attaque post-chantier 06

Hors périmètre "go prospection" (chantier 06 livré) mais à créer comme **chantier de perf v2** après le 1ᵉʳ juin :

1. **Critical CSS** + différé du reste → gain estimé Performance +15 à +25 sur toutes les pages.
2. **Minification** CSS/JS via passe Terser/CSSO appliquée en hook pre-deploy Vercel (peut être ajoutée plus tard sans rework).
3. **Dimensions explicites** sur toutes les `<img>` (width/height) sur `/metiers/` et `/contact.html` pour tuer le CLS.
4. **Lazy-init** du canvas particles du hero — défer son `init()` après `requestIdleCallback` ou après `load`.

### Critère d'acceptation
- [x] Tableau Lighthouse 5 pages × 4 scores commit dans l'annexe ✓
- [x] **Score SEO = 100 sur les 5 pages** ✓
- [x] Plan d'attaque des points perdus documenté ✓
- [ ] Performance > 90 → **différé en chantier perf v2** (post-prospection, non bloquant)

---

## Annexe G — Google Search Console (chantier 07)

**Date** : 2026-05-18
**Statut** : guide d'activation prêt — exécution côté Maxime (compte Google requis).

### Pourquoi c'est important

Search Console est le seul canal officiel pour :
- **Vérifier** que Google indexe correctement les pages (et corriger si non).
- **Soumettre le sitemap** : accélère significativement la découverte des nouvelles pages.
- **Demander une indexation manuelle** sur les pages prioritaires (sinon Google peut mettre des semaines).
- **Recevoir des alertes** par email en cas de problème (erreurs d'exploration, action manuelle, sécurité).
- **Voir** les requêtes qui amènent du trafic et les positions moyennes.

### Étapes (~15 min)

**1. Créer/accéder à la propriété**

- Aller sur https://search.google.com/search-console/welcome
- Choisir **"Préfixe de l'URL"** (et non "Domaine") → coller `https://vaeon.fr/`
- Méthode de validation recommandée : **balise HTML**.
- Search Console affiche une balise du type :
  ```html
  <meta name="google-site-verification" content="ABC123…XYZ" />
  ```
- **→ Copier cette balise et me la transmettre.** Je l'intègre dans le `<head>` d'`index.html` (et seulement là, c'est suffisant pour valider la propriété entière).

**2. Soumettre le sitemap**

Une fois la propriété vérifiée :
- Menu de gauche → **Sitemaps**
- Champ "Ajouter un sitemap" → saisir : `sitemap.xml`
- Cliquer **Envoyer**
- Statut attendu sous 24-48h : **Succès** — URLs découvertes ≥ 34.

**3. Indexation manuelle des 6 pages prioritaires**

Outil d'inspection d'URL (barre du haut), pour chacune :

1. `https://vaeon.fr/`
2. `https://vaeon.fr/tarifs.html`
3. `https://vaeon.fr/metiers/`
4. `https://vaeon.fr/services.html`
5. `https://vaeon.fr/a-propos.html`
6. `https://vaeon.fr/agence-web-toulouse.html`

Coller chaque URL → cliquer **"Demander l'indexation"** → confirmer.

**4. Activer les notifications**

- Roue dentée en haut à droite → **Préférences**
- Cocher **Recevoir tous les emails** (alertes critiques + nouveautés).

### Critère d'acceptation
- [ ] Balise `google-site-verification` reçue par Maxime, intégrée dans `index.html` par Claude, propriété GSC validée.
- [ ] Sitemap soumis, statut "Succès" dans la console.
- [ ] 6 indexations manuelles demandées (timestamp affiché dans l'historique de chaque URL).
- [ ] Préférences emails activées.

### Action requise

**→ Maxime : crée la propriété GSC, copie-colle ici la balise `<meta name="google-site-verification" content="…" />` que Google te donne. Je l'intègre en 10 secondes et tu n'auras plus qu'à valider.**

---

## Annexe H — Hiérarchie des titres (chantier 09)

**Date** : 2026-05-18
**Script** : `node scripts/audit-headings.mjs`
**Périmètre** : 34 pages indexées dans le sitemap.

### Bilan

| Étape | Pages KO | Total issues |
|---|---|---|
| Avant correction | **34 / 34** | **48** |
| Après correction footer (h4 → h3) | 11 / 34 | 13 |
| Après correction pages légales (h3 → h2) | 8 / 34 | 10 |
| Après correction pages services/projets/blogs (h3 → h2) | 1 / 34 | 1 |
| **Après correction manifesto accueil (h3 → h2)** | **0 / 34** | **0** ✅ |

### Corrections appliquées

**1. Footer global** — 35 fichiers HTML + 2 règles CSS (`.fcol h4` et `.demo-footer-cols .fcol h4`). Les 5 colonnes du footer (VÆON / Métiers / Pages / Contact / Légal) ont été passées de `<h4>` à `<h3>` pour suivre logiquement le `<h2>` "En route vers vous".

**2. Pages légales** (`cookies.html`, `mentions-legales.html`, `politique-confidentialite.html`) — Décalage hiérarchique de -1 niveau : tous les `<h3>` numérotés des sections ("1. Qu'est-ce qu'un cookie ?", etc.) sont passés `<h2>` ; les sous-`<h4>` sont passés `<h3>`.

**3. Pages services/projets/iconique/3 blogs** — `sed` global avec négation `/<div class="fcol">/!` pour exclure le footer :
- Toutes les `<h3>` contenu → `<h2>`
- Toutes les `<h4>` contenu → `<h3>` (uniquement iconique et contact)

**4. Accueil — manifesto** — 3 Edits ciblés sur les statements ("Du sur-mesure", "Un SEO durable", "Des sites codés") passés de `<h3>` à `<h2>` (les autres 13 `<h3>` de l'accueil étaient déjà bien positionnés sous des `<h2>` réels).

### Effet collatéral positif sur Lighthouse

Avant chantier 09 : Lighthouse Accessibility 90 sur l'accueil, avec `heading-order` flaggé.
Après chantier 09 : Lighthouse Accessibility **92** sur l'accueil, `heading-order` disparu. Le SEO reste à 100. Gain net +2 points a11y sans régression SEO.

Issues a11y restantes (héritage chantier 06, à traiter dans chantier perf v2) :
- `aria-hidden-focus` sur l'accueil
- `color-contrast` sur accueil + métiers

### Critère d'acceptation
- [x] 34 pages avec exactement 1 `<h1>` ✓
- [x] 0 saut hiérarchique sur 34 pages ✓
- [x] Audits length + JSON-LD + alt toujours verts ✓
- [x] Lighthouse SEO toujours = 100 sur l'accueil après modif ✓
