// =====================================================
// APPLY-CONFIG — moteur d'injection (Barber Iconique)
// Ne rien modifier ici : tout se règle dans config.js.
//
// Pipeline :
//   1. <head> (synchrone) : variables CSS + Google Fonts + meta
//   2. DOMContentLoaded   : contenus (header, hero, section 2)
// =====================================================

(() => {
  const C = window.SITE_CONFIG;
  if (!C) {
    console.error('[apply-config] window.SITE_CONFIG est manquant. Vérifiez que js/config.js est chargé AVANT apply-config.js.');
    return;
  }

  // ─── Helpers ───
  const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
  const setText = (sel, value) => {
    document.querySelectorAll(sel).forEach(el => { el.textContent = value ?? ''; });
  };
  const setAttr = (sel, attr, value) => {
    document.querySelectorAll(sel).forEach(el => {
      if (value == null || value === '') el.removeAttribute(attr);
      else el.setAttribute(attr, value);
    });
  };

  // ─── 1. Variables CSS (synchrone, avant peinture) ───
  const c = C.couleurs || {};
  const cssVars = {
    '--bg-creme':      c.bgCreme,
    '--bg-creme-warm': c.bgCremeWarm,
    '--ink':           c.ink,
    '--ink-soft':      c.inkSoft,
    '--ink-white':     c.inkWhite,
    '--accent':        c.accent,
    '--serif':         C.polices?.serif ? `"${C.polices.serif}", Georgia, serif` : null,
    '--sans':          C.polices?.sans  ? `"${C.polices.sans}", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` : null,
  };
  const root = document.documentElement;
  Object.entries(cssVars).forEach(([k, v]) => { if (v != null) root.style.setProperty(k, v); });

  // ─── 2. Google Fonts <link> dynamique ───
  if (C.polices?.googleFontsUrl) {
    const link = document.createElement('link');
    link.rel  = 'stylesheet';
    link.href = C.polices.googleFontsUrl;
    document.head.appendChild(link);
  }

  // ─── 3. Theme color ───
  let themeMeta = document.querySelector('meta[name="theme-color"]');
  if (!themeMeta) { themeMeta = document.createElement('meta'); themeMeta.name = 'theme-color'; document.head.appendChild(themeMeta); }
  themeMeta.content = c.bgCreme || '#F5F0E8';

  // ─── 4. Préchargement de la photo hero (link rel="preload") ───
  // Skip si la page n'a pas de hero (ex: page réservation, mentions légales).
  if (C.hero?.photoPath && document.querySelector('[data-cfg="hero-photo"]')) {
    let preload = document.querySelector('link[rel="preload"][as="image"][data-cfg="hero-preload"]');
    if (!preload) {
      preload = document.createElement('link');
      preload.rel = 'preload';
      preload.as  = 'image';
      preload.setAttribute('data-cfg', 'hero-preload');
      preload.setAttribute('fetchpriority', 'high');
      document.head.appendChild(preload);
    }
    preload.href = C.hero.photoPath;
  }

  // ─── 5. SEO — <title> et <meta description> ───
  // Source de vérité : C.seo (config.js). Le HTML statique porte déjà les
  // mêmes valeurs (lues par Google avant JS) ; on sync ici pour cohérence
  // et pour qu'une édition de config.js suffise à propager partout.
  // Fallback : ancien comportement (nomCommerce + slogan) si C.seo absent.
  if (C.seo?.title) {
    document.title = C.seo.title;
  } else {
    document.title = `${C.nomCommerce || C.nomMarque} · ${C.slogan || C.hero?.titre || ''}`;
  }
  if (C.seo?.description) {
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = C.seo.description;
  }

  // ─── 6. Injection contenu DOM ───
  const apply = () => {
    const h = C.hero || {};

    // ─────── HEADER ───────
    const hdr = C.header || {};
    setText('[data-cfg="brand-name"]', hdr.logoTexte || C.nomMarque || '');
    setText('[data-cfg="header-cta"]', hdr.ctaTexte || h.ctaTexte || 'PRENDRE RENDEZ-VOUS');
    setAttr('[data-cfg="header-cta"]', 'href', hdr.ctaAction || h.ctaAction || '#');

    // Désactivation smart-contrast si flag false → on fixe le theme à light
    const headerEl = document.querySelector('[data-header]');
    if (headerEl && hdr.smartContrast === false) {
      headerEl.dataset.headerTheme = 'light';
    }

    // ─────── HERO ───────
    setText('[data-cfg="hero-eyebrow-numero"]', h.eyebrowNumero || '');
    setText('[data-cfg="hero-eyebrow-marque"]', h.eyebrowMarque || '');
    setText('[data-cfg="hero-titre"]',          h.titre || '');
    setText('[data-cfg="hero-sous-titre"]',     h.sousTitre || '');
    setText('[data-cfg="hero-description"]',    h.description || '');
    setAttr('[data-cfg="hero-photo"]', 'src',   h.photoPath || '');
    setAttr('[data-cfg="hero-photo"]', 'alt',   h.photoAlt || '');
    setText('[data-cfg="hero-scroll-indicator"]', h.scrollIndicatorTexte || 'SCROLL');
    setAttr('[data-cfg-href="cta"]', 'href',    h.ctaAction || '#');

    // ─────── SECTION 2 — Personalise ───────
    const sp = C.sectionPersonalise || {};
    const sectionEl = document.querySelector('[data-section="personalise"]');
    if (sectionEl) {
      if (sp.actif === false) {
        sectionEl.style.display = 'none';
      } else {
        sectionEl.style.display = '';
      }
    }

    setText('[data-cfg="personalise-description"]', sp.description  || '');

    // ─────── Rendu dynamique du titre éclaté ───────
    // titreLignes est une liste de mots avec :
    //   - mot   : texte
    //   - style : "fill" | "italic-small"
    //   - suiteLigne : true → reste sur la même ligne que le mot précédent
    //   - insererPortraitApres : true → la photo portrait vient APRÈS ce mot
    //
    // On regroupe les mots en lignes (suiteLigne === true → même ligne),
    // on ajoute un data-line-index pour le CSS responsive (chevauchements).
    // La photo portrait est insérée juste après le mot qui a insererPortraitApres.
    const titreEl = document.querySelector('[data-cfg-list="personalise-titre"]');
    if (titreEl && Array.isArray(sp.titreLignes)) {

      // Étape 1 : grouper les mots en lignes (chaque mot avec suiteLigne joint la ligne précédente)
      const lignes = [];
      sp.titreLignes.forEach((m, i) => {
        if (i === 0 || !m.suiteLigne) {
          lignes.push([m]);
        } else {
          lignes[lignes.length - 1].push(m);
        }
      });

      // Étape 2 : repérer si un mot demande l'insertion de la photo APRÈS sa ligne
      // (la flag est sur le MOT, on la propage à l'index de la ligne contenante)
      const insertionApresLigne = new Set();
      let cursor = 0;
      lignes.forEach((ligne, idxLigne) => {
        ligne.forEach(m => {
          if (m.insererPortraitApres) insertionApresLigne.add(idxLigne);
        });
      });

      // Étape 3 : construire le HTML
      let html = '';
      lignes.forEach((ligne, idx) => {
        html += `<span class="title-line" data-line-index="${idx}">`;
        ligne.forEach(m => {
          const cls = m.style === 'italic-small'
            ? 'title-word title-word-italic-small'
            : 'title-word title-word-fill';
          html += `<span class="${cls}">${escapeHtml(m.mot)}</span>`;
        });
        html += `</span>`;

        // Photo après cette ligne ?
        if (insertionApresLigne.has(idx)) {
          const portraitSrc = sp.portraitPath || '';
          const portraitAlt = escapeHtml(sp.portraitAlt || '');
          html += `
            <div class="personalise-portrait" data-portrait>
              <img class="portrait-img" src="${escapeHtml(portraitSrc)}" alt="${portraitAlt}" loading="lazy" />
            </div>`;
        }
      });

      titreEl.innerHTML = html;

      // Sécurité : si la photo portrait charge en erreur, on retire le src
      // pour activer le fallback CSS (placeholder gris "PORTRAIT À AJOUTER").
      const portraitImg = titreEl.querySelector('.portrait-img');
      if (portraitImg) {
        portraitImg.addEventListener('error', () => {
          console.warn('[apply-config] Portrait introuvable :', portraitImg.getAttribute('src'), '— fallback placeholder activé.');
          portraitImg.removeAttribute('src');
        }, { once: true });
      }
    }

    // ─────── SECTION 3 — L'Expérience / Méthode ───────
    const se = C.sectionExperience || {};
    const expSection = document.querySelector('[data-section="experience"]');

    // Toggle visibilité de la section
    if (expSection) {
      expSection.style.display = (se.actif === false) ? 'none' : '';
    }

    // Si la section est désactivée, skip l'injection (économise les sélecteurs)
    if (se.actif !== false && expSection) {
      // Marque + sous-titre (texte simple)
      setText('[data-cfg="experience-brand"]',    se.marque    || '[EYEBROW]');
      setText('[data-cfg="experience-subtitle"]', se.sousTitre || '');

      // Titre — 2 lignes via <br/> (innerHTML car on injecte le break)
      const titleEl = document.querySelector('[data-cfg="experience-title"]');
      if (titleEl) {
        const t1 = escapeHtml(se.titre || '[TITRE]');
        const t2 = escapeHtml(se.titreSousLigne || '[SOUS-LIGNE]');
        titleEl.innerHTML = `${t1}<br>${t2}`;
      }

      // 3 raisons (générées dynamiquement)
      const reasonsWrap = document.querySelector('[data-cfg-list="experience-reasons"]');
      if (reasonsWrap && Array.isArray(se.raisons)) {
        reasonsWrap.innerHTML = se.raisons.map(r => `
          <div class="experience-reason">
            <h3 class="reason-title">${escapeHtml(r.titre || '')}</h3>
            <p class="reason-text">${escapeHtml(r.texte || '')}</p>
          </div>`).join('');
      }

      // Photos latérales (src + alt + fallback onerror)
      const photoLeftImg  = document.querySelector('[data-cfg="experience-photo-left"]');
      if (photoLeftImg) {
        if (se.photoLeft) photoLeftImg.setAttribute('src', se.photoLeft);
        if (se.photoLeftAlt) photoLeftImg.setAttribute('alt', se.photoLeftAlt);
      }
      const photoRightImg = document.querySelector('[data-cfg="experience-photo-right"]');
      if (photoRightImg) {
        if (se.photoRight) photoRightImg.setAttribute('src', se.photoRight);
        if (se.photoRightAlt) photoRightImg.setAttribute('alt', se.photoRightAlt);
      }
    }

    // ─────── SECTION 4 — Interactive Face Map ───────
    const sf = C.sectionFacemap || {};
    const facemapSection = document.querySelector('[data-section="facemap"]');

    // Toggle visibilité
    if (facemapSection) {
      facemapSection.style.display = (sf.actif === false) ? 'none' : '';
    }

    if (sf.actif !== false && facemapSection) {
      // Photo de fond
      const facemapBgImg = document.querySelector('[data-cfg="facemap-bg-img"]');
      if (facemapBgImg) {
        if (sf.photoFond)    facemapBgImg.setAttribute('src', sf.photoFond);
        if (sf.photoFondAlt) facemapBgImg.setAttribute('alt', sf.photoFondAlt);
      }

      // Marquee : duplique le texte pour avoir une boucle continue
      const marqueeSpans = document.querySelectorAll('[data-cfg="facemap-marquee"]');
      if (marqueeSpans.length && sf.marqueeText) {
        const repeatedText = `${sf.marqueeText} · `.repeat(8).trimEnd();
        marqueeSpans.forEach(span => { span.textContent = repeatedText; });
      }

      // Repositionne les 5 points selon les coordonnées x/y de la config
      // (chaque point a un data-prestation-id qui matche la clé dans
      // sf.prestations → lash, brow, nails, esthetique, massages)
      const points = document.querySelectorAll('.facemap-point');
      points.forEach(point => {
        const id = point.dataset.prestationId;
        const prestation = sf.prestations && sf.prestations[id];
        if (prestation && prestation.position) {
          point.style.left = `${prestation.position.x}%`;
          point.style.top  = `${prestation.position.y}%`;
        }
      });

      // Le contenu initial de la card et les changements au hover sont
      // gérés par la classe FaceMapInteraction dans site.js, qui lit
      // window.SITE_CONFIG.sectionFacemap.prestations directement.
    }

    // ─────── SECTION 5 — Galerie Révélation ───────
    const sr = C.sectionRevelation || {};
    const revelationSection = document.querySelector('[data-section="revelation"]');

    // Toggle visibilité
    if (revelationSection) {
      revelationSection.style.display = (sr.actif === false) ? 'none' : '';
    }

    if (sr.actif !== false && revelationSection) {
      // Couleurs CSS injectées en variables locales sur la section
      if (sr.fondColor) revelationSection.style.setProperty('--revelation-bg', sr.fondColor);
      if (sr.spotColor) revelationSection.style.setProperty('--revelation-spot-color', sr.spotColor);

      // Hint text au-dessus de la bouche
      setText('[data-cfg="revelation-hint"]', sr.hintText || 'Bouge ta souris, scrolle pour entrer');

      // Photo révélée par la torche (src + alt)
      const torchImg = document.querySelector('[data-cfg="revelation-torch-photo"]');
      if (torchImg) {
        if (sr.torchPhoto)    torchImg.setAttribute('src', sr.torchPhoto);
        if (sr.torchPhotoAlt) torchImg.setAttribute('alt', sr.torchPhotoAlt);
      }

      // Eyebrow + titre galerie
      setText('[data-cfg="revelation-eyebrow"]', sr.galerieEyebrow || '— GALERIE —');
      setText('[data-cfg="revelation-titre"]',   sr.galerieTitre   || '');

      // 6 photos du carousel (classes alignées avec le HTML/CSS existant)
      const galleryTrack = document.querySelector('[data-cfg-list="revelation-photos"]');
      if (galleryTrack && Array.isArray(sr.photos) && sr.photos.length) {
        galleryTrack.innerHTML = sr.photos.map((p, idx) => `
          <article class="gallery-item" data-index="${idx}">
            <div class="gallery-img-wrapper">
              <img src="${escapeHtml(p.src || '')}" alt="${escapeHtml(p.alt || '')}" loading="lazy" />
            </div>
            <div class="gallery-caption">
              <p class="caption-tag">${escapeHtml(p.tag || '')}</p>
              <p class="caption-title">${escapeHtml(p.title || '')}</p>
            </div>
          </article>`).join('');

        // Fallback si une photo manque : placeholder gris
        galleryTrack.querySelectorAll('img').forEach(img => {
          img.addEventListener('error', () => {
            console.warn('[apply-config] Photo galerie introuvable :', img.getAttribute('src'));
            img.removeAttribute('src');
            img.parentElement?.classList.add('is-placeholder');
          }, { once: true });
        });
      }
    }

    // ─────── SECTION — Marques Partenaires (logos défilants) ───────
    const sPart = C.sectionPartenaires || {};
    const partSection = document.querySelector('[data-section="partenaires"]');

    if (partSection) {
      partSection.style.display = (sPart.actif === false) ? 'none' : '';
    }

    if (sPart.actif !== false && partSection) {
      // ─── Titre — split en mots avec data-delay (animation word-appear).
      // Chaque mot prend +120 ms ; la ligne 2 reprend après la ligne 1 (+300 ms de pause).
      // Le déclenchement effectif (pose de l'animation CSS) se fait quand la
      // section entre en vue, via IntersectionObserver dans site.js.
      const renderLine = (sel, text, startDelay) => {
        const el = document.querySelector(sel);
        if (!el || !text) return startDelay;
        const words = String(text).split(/\s+/).filter(Boolean);
        const STEP = 120;
        const html = words.map((w, i) => {
          const delay = startDelay + i * STEP;
          return `<span class="word-animate" data-delay="${delay}">${escapeHtml(w)}</span>`;
        }).join(' ');
        el.innerHTML = html;
        return startDelay + words.length * STEP;
      };
      const afterLine1 = renderLine('[data-cfg="partenaires-titre-1"]', sPart.titre1 || '', 0);
      renderLine('[data-cfg="partenaires-titre-2"]', sPart.titre2 || '', afterLine1 + 300);

      // ─── Logos — injection dans les 2 sets (boucle infinie côté JS)
      const sets = document.querySelectorAll('[data-cfg-list="partenaires-logos"]');
      if (sets.length && Array.isArray(sPart.logos) && sPart.logos.length) {
        const logosHtml = sPart.logos.map(src => `
          <div class="partenaires-logo">
            <img src="${escapeHtml(src)}" alt="" loading="lazy" decoding="async" onerror="this.parentElement.classList.add('is-missing')" />
          </div>`).join('');
        sets.forEach(set => { set.innerHTML = logosHtml; });
      }

      // Expose la config marquee pour site.js (vitesse + densité sparkles)
      window.__partenairesConfig = {
        cycleDurationMs: sPart.cycleDurationMs || 40000,
        sparklesDensity: sPart.sparklesDensity || 120,
      };
    }

    // ─────── SECTION — Avis Clientes (3 colonnes scroll vertical) ───────
    const sAvis = C.sectionAvis || {};
    const avisSection = document.querySelector('[data-section="avis"]');

    if (avisSection) {
      avisSection.style.display = (sAvis.actif === false) ? 'none' : '';
    }

    if (sAvis.actif !== false && avisSection) {
      // Titre — split en mots avec stagger (animation word-appear, déclenchée
      // par IntersectionObserver dans site.js — même mécanique que partenaires)
      const renderLine = (sel, text, startDelay) => {
        const el = document.querySelector(sel);
        if (!el || !text) return startDelay;
        const words = String(text).split(/\s+/).filter(Boolean);
        const STEP = 120;
        const html = words.map((w, i) => {
          const delay = startDelay + i * STEP;
          return `<span class="word-animate" data-delay="${delay}">${escapeHtml(w)}</span>`;
        }).join(' ');
        el.innerHTML = html;
        return startDelay + words.length * STEP;
      };
      const afterLine1 = renderLine('[data-cfg="avis-titre-1"]', sAvis.titre1 || '', 0);
      renderLine('[data-cfg="avis-titre-2"]', sAvis.titre2 || '', afterLine1 + 300);

      // Cartes — répartition en 3 colonnes (9 avis = 3×3 ; si moins, on remplit
      // les premières colonnes en priorité). Chaque colonne est dupliquée par
      // le JS de marquee pour la boucle infinie.
      const avis = Array.isArray(sAvis.avis) ? sAvis.avis : [];
      const initials = (nom) => String(nom || '').trim().split(/\s+/).map(w => w[0] || '').join('').slice(0, 2).toUpperCase();
      const cardHtml = (a) => `
        <article class="avis-card">
          <p class="avis-card-text">${escapeHtml(a.texte || '')}</p>
          <div class="avis-card-author">
            <div class="avis-card-avatar" aria-hidden="true">${escapeHtml(initials(a.nom))}</div>
            <div class="avis-card-meta">
              <p class="avis-card-name">${escapeHtml(a.nom || '')}</p>
              <p class="avis-card-role">${escapeHtml(a.role || '')}</p>
            </div>
          </div>
        </article>`;

      const colSize = Math.ceil(avis.length / 3) || 3;
      const cols = [
        avis.slice(0, colSize),
        avis.slice(colSize, colSize * 2),
        avis.slice(colSize * 2, colSize * 3),
      ];
      ['avis-col-1', 'avis-col-2', 'avis-col-3'].forEach((key, idx) => {
        const track = document.querySelector(`[data-cfg-list="${key}"]`);
        if (!track) return;
        const single = cols[idx].map(cardHtml).join('');
        // Duplique le set pour permettre la boucle infinie (translateY -50%)
        track.innerHTML = single + single;
      });

      // Expose les durées de défilement par colonne pour site.js
      window.__avisConfig = {
        col1: (sAvis.colonnes && sAvis.colonnes.col1) || 22,
        col2: (sAvis.colonnes && sAvis.colonnes.col2) || 28,
        col3: (sAvis.colonnes && sAvis.colonnes.col3) || 25,
      };
    }

    // ─────── SECTION 7 — Nos Partenaires (roue marques) ───────
    const sm = C.sectionMarques || {};
    const marquesSection = document.querySelector('.section-marques');

    if (marquesSection) {
      marquesSection.style.display = (sm.actif === false) ? 'none' : '';
    }

    if (sm.actif !== false && marquesSection) {
      setText('[data-cfg="marques-eyebrow"]',     sm.eyebrow         || '— NOS PARTENAIRES —');
      setText('[data-cfg="marques-caption"]',     sm.caption         || 'Ils nous font confiance');

      // Description initiale = description de la 1re marque (ou descriptionText fallback)
      const firstMarqueDesc = (sm.marques && sm.marques[0] && sm.marques[0].description) || '';
      setText('[data-cfg="marques-description"]', firstMarqueDesc || sm.descriptionText || '');

      // Expose les descriptions par marque pour BrandsWheel.syncActive
      window.__marquesDescriptions = (sm.marques || []).map(m => m.description || sm.descriptionText || '');
      // Expose aussi les preview images pour le hover effect (BrandsWheel)
      window.__marquesPreviews = (sm.marques || []).map(m => m.previewImage || '');

      if (Array.isArray(sm.marques) && sm.marques.length) {
        // (a) Numérotation verticale
        const navNumbers = document.querySelector('.nav-numbers');
        if (navNumbers) {
          navNumbers.innerHTML = sm.marques.map((m, i) => `
            <li class="nav-num${i === 0 ? ' active' : ''}" data-nav-num="${i}">
              <span class="num-label">${i + 1}</span>
              <span class="num-line"></span>
            </li>`).join('');
        }

        // (b) Stack des marques
        const wheelList = document.querySelector('[data-wheel-list]');
        if (wheelList) {
          wheelList.innerHTML = sm.marques.map((m, i) => `
            <li class="wheel-item${i === 0 ? ' active' : ''}" data-wheel-item="${i}" data-brand="${escapeHtml(m.slug || '')}">
              <span class="wheel-name">${escapeHtml(m.nom || '')}</span>
            </li>`).join('');
        }

        // (c) Stack des logos officiels
        const logoStack = document.querySelector('[data-logo-stack]');
        if (logoStack) {
          logoStack.innerHTML = sm.marques.map((m, i) => `
            <div class="logo-slide${i === 0 ? ' active' : ''}" data-logo-slide="${i}">
              <img src="${escapeHtml(m.logo || '')}" alt="${escapeHtml(m.nom || '')}" class="logo-img" onerror="this.style.display='none'" />
              <div class="logo-fallback">${escapeHtml((m.nom || '').toUpperCase())}</div>
            </div>`).join('');
        }
      }
    }

    // ─────── FOOTER — Minimaliste 3 colonnes ───────
    const ft = C.footer || {};
    const footerEl = document.querySelector('.site-footer');

    // Toggle visibilité de tout le footer
    if (footerEl) {
      footerEl.style.display = (ft.actif === false) ? 'none' : '';
    }

    if (ft.actif !== false && footerEl) {

      // Nom du salon (bottom bar — italique)
      setText('.footer-brand', ft.nomCommerce || C.nomCommerce || '[NOM MARQUE]');

      // ─ Colonne 1 — Maison (nav interne) ─
      const mais = ft.colonneMaison || {};
      const maisLabel = document.querySelectorAll('.footer-label')[0];
      if (maisLabel && mais.label) maisLabel.textContent = mais.label;

      const maisList = document.querySelector('.footer-column:nth-child(1) .footer-list');
      if (maisList && Array.isArray(mais.liens)) {
        maisList.innerHTML = mais.liens.map(l => `
          <li><a href="${escapeHtml(l.href || '#')}" class="footer-link">${escapeHtml(l.texte || '')}</a></li>
        `).join('');
      }

      // ─ Colonne 2 — Contact ─
      const cont = ft.colonneContact || {};
      const contLabel = document.querySelectorAll('.footer-label')[1];
      if (contLabel && cont.label) contLabel.textContent = cont.label;

      const contList = document.querySelector('.footer-column:nth-child(2) .footer-list');
      if (contList) {
        const tel        = cont.telephone || '';
        const telHref    = tel ? `tel:${tel.replace(/\s/g, '')}` : '#';
        const email      = cont.email || '';
        const emailHref  = email ? `mailto:${email}` : '#';
        const adresseHtml = (cont.adresse || '').replace(/\n/g, '<br>');
        const ctaTexte   = cont.ctaTexte || 'Prendre rendez-vous →';
        const ctaHref    = cont.ctaLien || '#';

        contList.innerHTML = `
          <li><a href="${escapeHtml(telHref)}" class="footer-link">${escapeHtml(tel)}</a></li>
          <li><a href="${escapeHtml(emailHref)}" class="footer-link">${escapeHtml(email)}</a></li>
          <li class="footer-address">${adresseHtml}</li>
          <li><a href="${escapeHtml(ctaHref)}" class="footer-link footer-cta">${escapeHtml(ctaTexte)}</a></li>
        `;
      }

      // ─ Colonne 3 — Réseaux ─
      const res = ft.colonneReseaux || {};
      const resLabel = document.querySelectorAll('.footer-label')[2];
      if (resLabel && res.label) resLabel.textContent = res.label;

      const instaLink = document.querySelector('.footer-social');
      if (instaLink && res.instagramUrl) {
        instaLink.setAttribute('href', res.instagramUrl);
      }

      const tiktokLink = document.querySelector('.footer-tiktok');
      if (tiktokLink && res.tiktokUrl) {
        tiktokLink.setAttribute('href', res.tiktokUrl);
      }

      // ─ Bottom bar — copyright + mentions ─
      setText('.footer-copyright', ft.copyright || '© [NOM MARQUE]');

      const mentions = document.querySelectorAll('.footer-link-small');
      if (mentions[0] && ft.mentionsLegalesLien) mentions[0].setAttribute('href', ft.mentionsLegalesLien);
      if (mentions[1] && ft.politiqueLien)       mentions[1].setAttribute('href', ft.politiqueLien);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }
})();


// ─── Patch démo : liens internes & canonical relatifs au dossier de la démo ───
// Démos servies sous /demo/<categorie>/<niveau>/ ; les chemins absolus (« / »,
// « /reservation », « /#section ») visaient la racine vaeon.fr → 404 en prod.
// On les réécrit en relatif ; la profondeur est déduite du src de ce script.
(function () {
  function fixLinks() {
    var s = document.querySelector('script[src$="js/apply-config.js"]');
    var src = s ? s.getAttribute('src') : 'js/apply-config.js';
    var depth = (src.match(/\.\.\//g) || []).length; // 0 = accueil, 1 = sous-page
    var up = depth === 0 ? './' : new Array(depth + 1).join('../');
    document.querySelectorAll('a[href^="/"]').forEach(function (a) {
      var h = a.getAttribute('href');
      if (!h || h.charAt(1) === '/') return; // ignore « // » (protocol-relative)
      a.setAttribute('href', up + h.slice(1));
    });
    var can = document.querySelector('link[rel="canonical"]');
    if (can) can.setAttribute('href', location.origin + location.pathname);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fixLinks);
  else fixLinks();
})();