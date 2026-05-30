// =====================================================
// APPLY-CONFIG — moteur d'injection
// Ne rien modifier ici : tout se règle dans config.js.
//
// Pipeline :
//   1. <head> (synchrone) : variables CSS, fonts, meta, title, JSON-LD
//   2. DOMContentLoaded   : contenus de page (textes + sections dynamiques)
// =====================================================

(() => {
  const C = window.SITE_CONFIG;
  if (!C) {
    console.error('[apply-config] window.SITE_CONFIG est manquant. Vérifiez que js/config.js est chargé AVANT apply-config.js.');
    return;
  }

  // ───────────────────── Helpers ─────────────────────
  const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
  // Échappe le HTML PUIS convertit **mot** → <em>mot</em>.
  // → safe pour innerHTML : tout texte client est échappé, seul **...** devient du markup.
  const mdItalic = (str) => escapeHtml(str).replace(/\*\*(.+?)\*\*/g, '<em>$1</em>');

  const setText = (sel, value) => {
    document.querySelectorAll(sel).forEach(el => { el.textContent = value ?? ''; });
  };
  const setHTML = (sel, html) => {
    document.querySelectorAll(sel).forEach(el => { el.innerHTML = html ?? ''; });
  };
  const setAttr = (sel, attr, value) => {
    document.querySelectorAll(sel).forEach(el => {
      if (value == null || value === '') el.removeAttribute(attr);
      else el.setAttribute(attr, value);
    });
  };

  // Encodage compatible URL (Maps, etc.)
  const encQuery = (s) => encodeURIComponent(s).replace(/%20/g, '+');

  // ─── 1. Variables CSS (synchrone, avant peinture) ───
  const c = C.couleurs || {};
  const cssVars = {
    '--bg':        c.fond,
    '--bg-soft':   c.fondSoft,
    '--bg-deep':   c.fondDeep,
    '--ink':       c.texte,
    '--ink-soft':  c.texteSoft,
    '--accent':    c.accent,
    '--accent-d':  c.accentFonce,
    '--rose':      c.rose,
    '--rose-soft': c.roseSoft,
    '--gold':      c.gold,
    '--muted':     c.muted,
    '--line':      c.line,
    '--serif':     C.polices?.serif ? `"${C.polices.serif}", Georgia, serif` : null,
    '--sans':      C.polices?.sans  ? `"${C.polices.sans}", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` : null,
    '--script':    C.polices?.script ? `"${C.polices.script}", cursive` : null,
  };
  const root = document.documentElement;
  Object.entries(cssVars).forEach(([k, v]) => { if (v != null) root.style.setProperty(k, v); });

  // ─── 2. Google Fonts <link> dynamique ───
  if (C.polices?.googleFontsUrl) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = C.polices.googleFontsUrl;
    document.head.appendChild(link);
  }

  // ─── 3. Favicon dynamique (initiale du nom du commerce) ───
  const initiale = (C.nomCommerce || 'A').trim().charAt(0).toUpperCase();
  const accent = (c.accent || '#C98B7A').replace('#', '%23');
  const bg = (c.fond || '#F5EFE5').replace('#', '%23');
  const faviconSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='${bg}'/%3E%3Ctext x='50%25' y='56%25' text-anchor='middle' dominant-baseline='middle' font-family='${encodeURIComponent(C.polices?.serif || 'Georgia')},serif' font-style='italic' font-size='44' fill='${accent}'%3E${initiale}%3C/text%3E%3C/svg%3E`;
  let favicon = document.querySelector("link[rel='icon']");
  if (!favicon) { favicon = document.createElement('link'); favicon.rel = 'icon'; document.head.appendChild(favicon); }
  favicon.href = faviconSvg;

  // ─── 4. Theme color ───
  let themeMeta = document.querySelector('meta[name="theme-color"]');
  if (!themeMeta) { themeMeta = document.createElement('meta'); themeMeta.name = 'theme-color'; document.head.appendChild(themeMeta); }
  themeMeta.content = c.fond || '#F5EFE5';

  // ─── 5. <title> + meta description selon page ───
  const page = document.body?.dataset?.page || (document.documentElement.dataset.page) || 'home';
  // dataset peut être lu plus tard (avant body) → on relit à DOMContentLoaded aussi.
  const setMetaTags = () => {
    const seo = C.seo || {};
    const titleByPage = {
      home: seo.titreOnglet,
      reservation: seo.titreReservation,
      mentions: seo.titreMentions,
    };
    const realPage = document.body?.dataset?.page || 'home';
    const title = titleByPage[realPage] || seo.titreOnglet || C.nomCommerce;
    if (title) document.title = title;

    const descMap = {
      home: seo.metaDescription,
      reservation: `Réservez votre rendez-vous chez ${C.nomCommerce}, ${C.typeCommerce?.toLowerCase()} à ${C.ville}.`,
      mentions: `Mentions légales du site ${C.nomCommerce} — ${C.typeCommerce?.toLowerCase()} à ${C.ville}.`,
    };
    const desc = descMap[realPage] || seo.metaDescription;
    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) { descMeta = document.createElement('meta'); descMeta.name = 'description'; document.head.appendChild(descMeta); }
    if (desc) descMeta.content = desc;

    // Open Graph
    const og = (prop, val) => {
      let el = document.querySelector(`meta[property="og:${prop}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute('property', `og:${prop}`); document.head.appendChild(el); }
      if (val) el.content = val;
    };
    og('type', 'website');
    og('title', title);
    og('description', desc);
    og('image', seo.ogImage);
  };
  setMetaTags(); // peut s'exécuter avant body — sera re-lancé à DCL pour fixer le data-page

  // ─── 6. JSON-LD Schema.org BeautySalon (home uniquement) ───
  const writeSchema = () => {
    if ((document.body?.dataset?.page || 'home') !== 'home') return;
    const horairesMap = {
      'lundi':'Monday','mardi':'Tuesday','mer':'Wednesday','mercredi':'Wednesday',
      'jeu':'Thursday','jeudi':'Thursday','ven':'Friday','vendredi':'Friday',
      'sam':'Saturday','samedi':'Saturday','dim':'Sunday','dimanche':'Sunday',
    };
    const parseHoraires = () => {
      const out = [];
      (C.horaires || []).forEach(({ jours, heures }) => {
        if (!heures || /ferm/i.test(heures)) return;
        // jours peut être "Lundi" ou "Mer · Jeu" ou "Ven · Sam"
        const days = jours.split(/[·,\/&]+/).map(s => s.trim().toLowerCase()).map(s => horairesMap[s] || horairesMap[s.split(' ')[0]] || null).filter(Boolean);
        const m = heures.match(/(\d{1,2})\s*h\s*(\d{0,2})\s*[–\-]\s*(\d{1,2})\s*h\s*(\d{0,2})/i);
        if (!m || !days.length) return;
        const opens = `${m[1].padStart(2,'0')}:${(m[2]||'00').padStart(2,'0')}`;
        const closes = `${m[3].padStart(2,'0')}:${(m[4]||'00').padStart(2,'0')}`;
        out.push({ '@type':'OpeningHoursSpecification', dayOfWeek: days.length === 1 ? days[0] : days, opens, closes });
      });
      return out;
    };
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BeautySalon',
      name: C.nomCommerce,
      image: C.seo?.ogImage,
      description: C.description,
      telephone: C.telephone,
      email: C.email,
      address: {
        '@type': 'PostalAddress',
        streetAddress: C.adresse,
        postalCode: C.codePostal,
        addressLocality: C.ville_postale || C.ville,
        addressCountry: 'FR',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: C.mapsLatitude,
        longitude: C.mapsLongitude,
      },
      openingHoursSpecification: parseHoraires(),
      priceRange: '€€€',
    };
    const tag = document.createElement('script');
    tag.type = 'application/ld+json';
    tag.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(tag);
  };

  // ─── 7. Injection contenu DOM ───
  const apply = () => {
    setMetaTags();
    writeSchema();

    // ─── HEADER + FOOTER (communs aux 3 pages) ───
    setAttr('[data-cfg="logo"]', 'src', C.logo);
    setAttr('[data-cfg="logo"]', 'alt', C.nomCommerce);
    setAttr('[data-cfg="brand-link"]', 'aria-label', `${C.nomCommerce}, accueil`);
    setText('[data-cfg="brand-name"]', C.nomCommerce);

    setText('[data-cfg="footer-tagline"]', C.footerTagline || C.slogan);
    setHTML('[data-cfg="footer-legal"]', `© ${escapeHtml(C.copyrightAnnee || new Date().getFullYear())} ${escapeHtml(C.nomCommerce)} · ${escapeHtml(C.adresse)}, ${escapeHtml(C.codePostal)} ${escapeHtml(C.ville_postale || C.ville)} · Tous droits réservés · <a href="/mentions-legales">Mentions légales</a>`);

    // ─── RÉSEAUX SOCIAUX (footer) ───
    const socialMap = { instagram: C.instagram, facebook: C.facebook, tiktok: C.tiktok };
    document.querySelectorAll('[data-cfg-social]').forEach(el => {
      const k = el.dataset.cfgSocial;
      const url = socialMap[k];
      if (url) { el.setAttribute('href', url); el.style.display = ''; }
      else { el.style.display = 'none'; }
    });

    // ─── LIENS RÉSERVATION (sms, tel, /reservation) ───
    setAttr('[data-cfg-href="reservation"]', 'href', '/reservation');
    setAttr('[data-cfg-href="sms"]',         'href', `sms:${C.telephoneSMS || C.telephone}`);
    setAttr('[data-cfg-href="tel"]',         'href', `tel:${C.telephone}`);
    setAttr('[data-cfg-href="email"]',       'href', `mailto:${C.email}`);
    setAttr('[data-cfg-href="instagram"]',   'href', C.instagram || '#');

    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encQuery(C.mapsAdresseComplete)}&travelmode=driving&dir_action=navigate`;
    setAttr('[data-cfg-href="maps-directions"]', 'href', mapsUrl);
    setAttr('[data-cfg-href="maps-directions"]', 'target', '_blank');
    setAttr('[data-cfg-href="maps-directions"]', 'rel', 'noopener');

    const _lat = parseFloat(C.mapsLatitude), _lon = parseFloat(C.mapsLongitude);
    const _dLat = 0.004, _dLon = 0.009; // emprise ~quelques centaines de mètres
    const mapsEmbed = `https://www.openstreetmap.org/export/embed.html?bbox=${_lon - _dLon}%2C${_lat - _dLat}%2C${_lon + _dLon}%2C${_lat + _dLat}&layer=mapnik&marker=${_lat}%2C${_lon}`;
    setAttr('[data-cfg="maps-iframe"]', 'src', mapsEmbed);
    setAttr('[data-cfg="maps-iframe"]', 'title', `Plan — ${C.nomCommerce}`);

    // ============================================================
    // PAGE ACCUEIL
    // ============================================================
    const realPage = document.body?.dataset?.page || 'home';

    if (realPage === 'home') {
      // ─── HERO ───
      const h = C.hero || {};
      setHTML('[data-cfg="hero-eyebrow"]',  `<span class="rule"></span>${escapeHtml(h.eyebrow || '')}`);
      setHTML('[data-cfg="hero-line1"]',    `<span>${escapeHtml(h.titreLigne1 || '')}</span>`);
      setHTML('[data-cfg="hero-line2"]',    `<span>${mdItalic(h.titreLigne2 || '')}</span>`);

      const promoEl = document.querySelector('[data-cfg="hero-promo"]');
      if (promoEl) {
        if (h.promoTexte && h.promoTexte.trim()) {
          promoEl.innerHTML = `<span class="hero-promo-rule"></span>${mdItalic(h.promoTexte)}`;
          promoEl.style.display = '';
        } else {
          promoEl.style.display = 'none';
        }
      }

      setText('[data-cfg="hero-btn-reserver"]', h.boutonReserver || 'Réserver');
      const heroLinkEl = document.querySelector('[data-cfg="hero-link-decouvrir"]');
      if (heroLinkEl) heroLinkEl.innerHTML = `${escapeHtml(h.lienDecouvrir || 'Découvrir')} <span aria-hidden="true">→</span>`;

      // Sources vidéo (re-injection des <source> depuis la config)
      const heroVideo = document.getElementById('heroVideo');
      if (heroVideo) {
        heroVideo.dataset.srcMobile = h.videoMobile || '';
        heroVideo.dataset.srcDesktop = h.videoDesktop || '';
        heroVideo.innerHTML = `
          <source media="(min-width: 768px)" src="${escapeHtml(h.videoDesktop || '')}" type='video/mp4; codecs="avc1.640028,mp4a.40.2"' />
          <source media="(min-width: 768px)" src="${escapeHtml(h.videoDesktop || '')}" type="video/mp4" />
          <source src="${escapeHtml(h.videoMobile || '')}" type='video/mp4; codecs="avc1.640028,mp4a.40.2"' />
          <source src="${escapeHtml(h.videoMobile || '')}" type="video/mp4" />`;
        // Note : pas de poster ni de background-image — le hero reste noir
        // (couleur CSS) jusqu'à ce que la vidéo soit prête à jouer.
        // Évite le "flash" d'image avant la vidéo.
      }

      // ─── HISTOIRE ───
      const hi = C.histoire || {};
      setHTML('[data-cfg="histoire-eyebrow"]', `<span class="rule"></span>${escapeHtml(hi.eyebrow || '')}`);
      setHTML('[data-cfg="histoire-titre"]',   mdItalic(hi.titre || ''));
      setText('[data-cfg="histoire-intro"]',   hi.intro || '');
      setAttr('[data-cfg="histoire-image"]',   'src', hi.image || '');
      setAttr('[data-cfg="histoire-image"]',   'alt', `L'institut ${C.nomCommerce}`);

      const piliersWrap = document.querySelector('[data-cfg-list="histoire-piliers"]');
      if (piliersWrap && Array.isArray(hi.piliers)) {
        piliersWrap.innerHTML = hi.piliers.map(p => `
          <p class="histoire-pillar"><span class="pillar-tag">${escapeHtml(p.tag)}</span>${escapeHtml(p.texte)}</p>
        `).join('');
      }

      const statsWrap = document.querySelector('[data-cfg-list="histoire-stats"]');
      if (statsWrap && Array.isArray(hi.stats)) {
        statsWrap.innerHTML = hi.stats.map(s => `
          <div class="stat"><span class="num">${escapeHtml(s.num)}</span><span class="lbl">${escapeHtml(s.label).replace(' ', '<br/>')}</span></div>
        `).join('');
      }

      // ─── PRESTATIONS ───
      setHTML('[data-cfg="prestations-eyebrow"]', `<span class="rule"></span>${escapeHtml(C.prestationsEyebrow || '')}<span class="rule"></span>`);
      setHTML('[data-cfg="prestations-titre"]',   mdItalic(C.prestationsTitre || ''));

      const prestaWrap = document.querySelector('[data-cfg-list="prestations"]');
      if (prestaWrap && Array.isArray(C.prestations)) {
        prestaWrap.innerHTML = C.prestations.map((p, i) => {
          const num = String(i + 1).padStart(2, '0');
          const nameHtml = mdItalic(p.nom);
          const altText = (p.nom || '').replace(/\*\*/g, '');
          const ctaLabel = escapeHtml(p.cta || 'Réserver');
          const ctaHref  = p.planityUrl ? escapeHtml(p.planityUrl) : '/reservation';
          const ctaTarget = p.planityUrl ? ' target="_blank" rel="noopener"' : '';
          return `
            <article class="presta-row reveal" data-presta="${i}">
              <span class="presta-num">— ${num}</span>
              <h3 class="presta-name">${nameHtml}</h3>
              <p class="presta-desc">${escapeHtml(p.description || '')}</p>
              <div class="presta-img-wrap"><img src="${escapeHtml(p.image || '')}" alt="${escapeHtml(altText)}" loading="lazy"/></div>
              <a class="presta-cta-btn" href="${ctaHref}"${ctaTarget} aria-label="${ctaLabel} — ${escapeHtml(altText)}">
                <span>${ctaLabel}</span>
                <span class="presta-cta-arrow" aria-hidden="true">→</span>
              </a>
            </article>`;
        }).join('');
      }

      // ─── PARTENAIRES ───
      const partSection = document.querySelector('[data-cfg-section="partenaires"]');
      if (partSection) {
        if (!C.partenairesActif || !Array.isArray(C.partenairesLogos) || C.partenairesLogos.length === 0) {
          partSection.style.display = 'none';
        } else {
          setHTML('[data-cfg="partenaires-eyebrow"]', `<span class="rule"></span>${escapeHtml(C.partenairesEyebrow || '')}<span class="rule"></span>`);
          setHTML('[data-cfg="partenaires-titre"]',   mdItalic(C.partenairesTitre || ''));

          const buildLogos = (ariaHidden) => C.partenairesLogos.map((src, i) =>
            `<img class="partner-logo" src="${escapeHtml(src)}" alt="${ariaHidden ? '' : `Partenaire ${i+1}`}" loading="eager" decoding="async" />`
          ).join('');

          const tracks = document.querySelectorAll('[data-cfg-list="partenaires-set"]');
          tracks.forEach((track, idx) => { track.innerHTML = buildLogos(idx > 0); });
        }
      }

      // ─── GALERIE INSTAGRAM (widget Behold OU fallback grid statique) ───
      const galSection = document.querySelector('[data-cfg-section="galerie"]');
      if (galSection) {
        if (!C.galerieActif) {
          galSection.style.display = 'none';
        } else {
          setHTML('[data-cfg="galerie-eyebrow"]', `<span class="rule"></span>${escapeHtml(C.galerieEyebrow || '')}<span class="rule"></span>`);
          setHTML('[data-cfg="galerie-titre"]',   mdItalic(C.galerieTitre || ''));
          setText('[data-cfg="galerie-handle"]',  C.galerieHandle || '');

          const beholdMount = document.querySelector('[data-cfg-behold-mount]');
          const feedId = (C.beholdFeedId || '').trim();
          if (beholdMount && feedId) {
            // Mode live : remplace la grid par le widget Behold + injecte le script
            beholdMount.innerHTML = `<behold-widget feed-id="${escapeHtml(feedId)}"></behold-widget>`;
            if (!document.querySelector('script[data-behold]')) {
              const s = document.createElement('script');
              s.type = 'module';
              s.src = 'https://w.behold.so/widget.js';
              s.dataset.behold = '1';
              document.body.appendChild(s);
            }
          } else {
            // Mode fallback : grid statique 3×2 carrée façon feed Insta
            const galWrap = document.querySelector('[data-cfg-list="galerie-photos"]');
            if (galWrap && Array.isArray(C.galeriePhotos)) {
              galWrap.innerHTML = C.galeriePhotos.map((p, i) => `
                <figure class="galerie-tile reveal">
                  <img src="${escapeHtml(p.src || '')}" alt="${escapeHtml(p.alt || `Galerie ${i+1}`)}" loading="lazy" decoding="async" />
                </figure>`).join('');
            }
          }
        }
      }

      // ─── AVIS ───
      const avisSection = document.querySelector('[data-cfg-section="avis"]');
      if (avisSection) {
        if (!C.avisActif) {
          avisSection.style.display = 'none';
        } else {
          setHTML('[data-cfg="avis-eyebrow"]', `<span class="rule"></span>${escapeHtml(C.avisEyebrow || '')}<span class="rule"></span>`);
          setHTML('[data-cfg="avis-titre"]',   mdItalic(C.avisTitre || ''));

          const gMark = `<span class="g-mark"><svg viewBox="0 0 24 24" width="14" height="14"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4c-.2 1.3-1 2.4-2 3.1v2.6h3.3c1.9-1.8 3-4.4 3-7.5z"/><path fill="#34A853" d="M12 22c2.7 0 5-1 6.7-2.4l-3.3-2.6c-.9.6-2 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1H3v2.6C4.7 19.9 8.1 22 12 22z"/><path fill="#FBBC05" d="M6.4 13.9c-.2-.6-.3-1.3-.3-1.9s.1-1.3.3-1.9V7.5H3C2.4 8.9 2 10.4 2 12s.4 3.1 1 4.5l3.4-2.6z"/><path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9C17 3 14.7 2 12 2 8.1 2 4.7 4.1 3 7.5l3.4 2.6C7.2 7.6 9.4 5.9 12 5.9z"/></svg></span>`;
          const avisWrap = document.querySelector('[data-cfg-list="avis"]');
          if (avisWrap && Array.isArray(C.avis)) {
            avisWrap.innerHTML = C.avis.map(a => `
              <article class="avis-card reveal">
                <div class="stars" aria-label="5 étoiles">★★★★★</div>
                <p>"${escapeHtml(a.texte)}"</p>
                <footer><span class="avis-name">${escapeHtml(a.auteur)}</span>${gMark}</footer>
              </article>`).join('');
          }
        }
      }

      // ─── CONTACT ───
      setHTML('[data-cfg="contact-titre"]',  `${escapeHtml((C.nomCommerce || '').split(' ')[0])} <em>${escapeHtml((C.nomCommerce || '').split(' ').slice(1).join(' ') || '')}.</em>`);
      setHTML('[data-cfg="contact-adresse"]', `${escapeHtml(C.adresse)}<br/>${escapeHtml(C.codePostal)} ${escapeHtml(C.ville_postale || C.ville)}`);

      const hoursWrap = document.querySelector('[data-cfg-list="horaires"]');
      if (hoursWrap && Array.isArray(C.horaires)) {
        hoursWrap.innerHTML = C.horaires.map(h => `
          <div><dt>${escapeHtml(h.jours)}</dt><dd>${escapeHtml(h.heures)}</dd></div>
        `).join('');
      }

      // Texte du bouton SMS si présent
      setText('[data-cfg="sms-btn-text"]', 'Envoyer un SMS');
    }

    // ============================================================
    // PAGE RÉSERVATION
    // ============================================================
    if (realPage === 'reservation') {
      // Configuration Planity (DOIT être posée AVANT chargement script Planity)
      if (C.planityActif) {
        const container = document.getElementById('myContainerId');
        if (container) {
          window.planity = {
            key: C.planityKey,
            primaryColor: C.planityCouleurPrimaire || '#fff',
            container: container,
          };
        }
      }
      // Bouton SMS du fallback
      setAttr('[data-cfg-href="sms"]', 'href', `sms:${C.telephoneSMS || C.telephone}`);
    }

    // ============================================================
    // PAGE MENTIONS LÉGALES
    // ============================================================
    if (realPage === 'mentions') {
      const m = C.mentionsLegales || {};
      const map = {
        'ml-domaine':         m.domaineSite,
        'ml-raisonSociale':   m.raisonSociale,
        'ml-formeJuridique':  m.formeJuridique,
        'ml-siren':           m.siren,
        'ml-siret':           m.siret,
        'ml-tva':             m.tva,
        'ml-codeApe':         m.codeApe,
        'ml-siegeSocial':     m.siegeSocial,
        'ml-etablissement':   m.etablissement,
        'ml-directeur':       m.directeurPublication,
        'ml-email':           m.emailContact,
        'ml-telephone':       C.telephone,
        'ml-telephoneFmt':    formatPhoneFr(C.telephone),
        'ml-hebergeurNom':    m.hebergeurNom,
        'ml-hebergeurAdresse':m.hebergeurAdresse,
        'ml-hebergeurUrl':    m.hebergeurUrl,
      };
      Object.entries(map).forEach(([k, v]) => {
        document.querySelectorAll(`[data-cfg-ml="${k}"]`).forEach(el => {
          if (el.tagName === 'A' && k === 'ml-email')        el.href = `mailto:${v}`;
          else if (el.tagName === 'A' && k === 'ml-telephone') el.href = `tel:${v}`;
          else if (el.tagName === 'A' && k === 'ml-hebergeurUrl') el.href = v;
          // textContent : on formate le téléphone, et on n'écrase pas un texte
          // déjà présent dans un <a> sauf cas spéciaux (téléphone toujours formaté).
          const display = (k === 'ml-telephone') ? formatPhoneFr(v) : v;
          if (el.tagName !== 'A' || !el.textContent.trim() || k === 'ml-telephone') {
            el.textContent = display ?? '';
          } else {
            el.textContent = display;
          }
        });
      });
    }
  };

  // Format tel +33XXXXXXXXX → "0X XX XX XX XX"
  function formatPhoneFr(p) {
    if (!p) return '';
    const digits = String(p).replace(/[^\d]/g, '');
    let local = digits;
    if (digits.startsWith('33')) local = '0' + digits.slice(2);
    if (local.length !== 10) return p;
    return local.match(/.{1,2}/g).join(' ');
  }

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