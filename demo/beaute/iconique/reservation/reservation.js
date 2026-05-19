/* =====================================================
   RESERVATION.JS — Logique de la page de réservation
   Vanilla JS, no deps. Lenis est déjà initialisé par site.js.
   ===================================================== */
(() => {
  'use strict';

  // ─────────────────────────────────────────────────────
  // DONNÉES — soins par prestation
  // ─────────────────────────────────────────────────────
  const PRESTATIONS = {
    lash: {
      label: 'Lash Bar',
      soins: [
        { id: 'lash-cil',     name: 'Cil à cil',               duree: '1h30', prix: '95 €' },
        { id: 'lash-volume',  name: 'Volume russe',            duree: '2h00', prix: '120 €' },
        { id: 'lash-rehauss', name: 'Rehaussement de cils',    duree: '0h45', prix: '60 €' },
        { id: 'lash-teint',   name: 'Teinture des cils',       duree: '0h20', prix: '25 €' },
      ],
    },
    brow: {
      label: 'Brow Studio',
      soins: [
        { id: 'brow-restruct', name: 'Restructuration',         duree: '0h30', prix: '35 €' },
        { id: 'brow-teint',    name: 'Teinture sourcils',       duree: '0h20', prix: '20 €' },
        { id: 'brow-henne',    name: 'Henné',                   duree: '0h40', prix: '45 €' },
        { id: 'brow-lift',     name: 'Brow lift',               duree: '1h00', prix: '70 €' },
      ],
    },
    nails: {
      label: 'Nails Bar',
      soins: [
        { id: 'nails-mani',    name: 'Manucure simple',         duree: '0h45', prix: '40 €' },
        { id: 'nails-semi',    name: 'Semi-permanent',          duree: '1h15', prix: '55 €' },
        { id: 'nails-gel',     name: 'Gel / Gel-X',             duree: '1h45', prix: '85 €' },
        { id: 'nails-pedi',    name: 'Pédicure signature',      duree: '1h00', prix: '55 €' },
      ],
    },
    esthetique: {
      label: 'Skin Lab',
      soins: [
        { id: 'skin-signature', name: 'Soin signature',         duree: '1h00', prix: '95 €' },
        { id: 'skin-dermap',    name: 'Dermaplaning',           duree: '0h45', prix: '85 €' },
        { id: 'skin-peeling',   name: 'Peeling éclat',          duree: '1h15', prix: '110 €' },
        { id: 'skin-epil',      name: 'Épilation visage',       duree: '0h20', prix: '20 €' },
      ],
    },
    massages: {
      label: 'Massages',
      soins: [
        { id: 'mass-cali',   name: 'Californien',              duree: '1h00', prix: '90 €' },
        { id: 'mass-deep',   name: 'Deep tissue',              duree: '1h00', prix: '95 €' },
        { id: 'mass-pierre', name: 'Pierres chaudes',          duree: '1h15', prix: '110 €' },
        { id: 'mass-prena',  name: 'Prénatal',                 duree: '1h00', prix: '95 €' },
      ],
    },
  };

  const EXPERTS = {
    none:  { label: 'Aucune préférence' },
    clara: { label: 'Clara' },
    ines:  { label: 'Inès' },
    lou:   { label: 'Lou' },
  };

  // ─────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────
  const state = {
    prestation: null,
    soin:       null,
    date:       null,     // ISO yyyy-mm-dd
    slot:       null,     // "14:30"
    expert:     'none',
    prenom:     '',
    nom:        '',
    tel:        '',
    email:      '',
    message:    '',
  };

  // ─────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));

  const fmtDateFr = (iso) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  };
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // ─────────────────────────────────────────────────────
  // ÉTAPES — Progress chips & deep-link
  // ─────────────────────────────────────────────────────
  function updateProgress() {
    const reached = [
      true,                              // step 1 toujours actif
      !!state.prestation,                // step 2 si prestation
      !!state.soin,                      // step 3 si soin
      !!(state.date && state.slot),      // step 4 si date+slot
      !!(state.date && state.slot),      // step 5 (expert optionnel)
    ];
    const done = [
      !!state.prestation,
      !!state.soin,
      !!(state.date && state.slot),
      true,
      false,
    ];
    $$('.resa-progress-chip').forEach((chip, i) => {
      chip.classList.toggle('is-done', done[i] && reached[i + 1]);
    });
  }

  function markStepActive(stepNum) {
    $$('.resa-progress-chip').forEach(chip => {
      const isActive = Number(chip.dataset.step) === stepNum;
      chip.classList.toggle('is-active', isActive);
      if (isActive) chip.setAttribute('aria-current', 'step');
      else chip.removeAttribute('aria-current');
    });
  }

  // ─────────────────────────────────────────────────────
  // STEP 1 — PRESTATIONS
  // ─────────────────────────────────────────────────────
  function initPrestations() {
    $$('.resa-prestation-card').forEach(card => {
      card.addEventListener('click', () => selectPrestation(card.dataset.prestation));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectPrestation(card.dataset.prestation);
        }
      });
    });
  }

  function selectPrestation(id) {
    if (!PRESTATIONS[id]) return;
    state.prestation = id;
    // Reset les choix en aval qui dépendent de la prestation
    state.soin = null;
    $$('.resa-prestation-card').forEach(c => {
      const sel = c.dataset.prestation === id;
      c.classList.toggle('is-selected', sel);
      c.setAttribute('aria-checked', sel ? 'true' : 'false');
    });
    renderSoins();
    updateProgress();
    // Scroll vers step 2
    smoothScrollTo('#step-2');
  }

  // ─────────────────────────────────────────────────────
  // STEP 2 — SOINS (filtrés selon prestation)
  // ─────────────────────────────────────────────────────
  function renderSoins() {
    const list = $('[data-soin-list]');
    const hint = $('[data-soin-hint]');
    if (!list) return;
    if (!state.prestation) {
      list.innerHTML = '';
      if (hint) hint.style.display = '';
      return;
    }
    if (hint) hint.style.display = 'none';
    const soins = PRESTATIONS[state.prestation].soins;
    list.innerHTML = soins.map(s => `
      <li>
        <button type="button" class="resa-soin" role="radio" aria-checked="false" data-soin="${escapeHtml(s.id)}">
          <span class="resa-soin-name">${escapeHtml(s.name)}</span>
          <span class="resa-soin-meta">${escapeHtml(s.duree)}</span>
          <span class="resa-soin-price">${escapeHtml(s.prix)}</span>
        </button>
      </li>
    `).join('');
    list.querySelectorAll('.resa-soin').forEach(btn => {
      btn.addEventListener('click', () => selectSoin(btn.dataset.soin));
    });
  }

  function selectSoin(id) {
    const soin = PRESTATIONS[state.prestation]?.soins.find(s => s.id === id);
    if (!soin) return;
    state.soin = soin;
    $$('.resa-soin').forEach(b => {
      const sel = b.dataset.soin === id;
      b.classList.toggle('is-selected', sel);
      b.setAttribute('aria-checked', sel ? 'true' : 'false');
    });
    updateProgress();
    smoothScrollTo('#step-3');
  }

  // ─────────────────────────────────────────────────────
  // STEP 3 — CALENDRIER + CRÉNEAUX
  // ─────────────────────────────────────────────────────
  const MOIS_FR = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];

  // Le calendrier navigue dans `viewMonth` (1er du mois affiché)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let viewMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  function initCalendar() {
    $('[data-cal-prev]')?.addEventListener('click', () => {
      const prev = new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1);
      // Ne pas reculer avant le mois en cours
      if (prev < new Date(today.getFullYear(), today.getMonth(), 1)) return;
      viewMonth = prev;
      renderCalendar();
    });
    $('[data-cal-next]')?.addEventListener('click', () => {
      // Limite à 6 mois en avant
      const maxAhead = new Date(today.getFullYear(), today.getMonth() + 6, 1);
      const next = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1);
      if (next > maxAhead) return;
      viewMonth = next;
      renderCalendar();
    });
    renderCalendar();
  }

  function renderCalendar() {
    const monthLabel = $('[data-cal-month]');
    const daysEl     = $('[data-cal-days]');
    if (!monthLabel || !daysEl) return;

    const y = viewMonth.getFullYear();
    const m = viewMonth.getMonth();
    monthLabel.textContent = `${MOIS_FR[m]} ${y}`;

    // Bouton prev disabled si mois courant
    const prevBtn = $('[data-cal-prev]');
    if (prevBtn) {
      const isCurrentMonth = (y === today.getFullYear() && m === today.getMonth());
      prevBtn.disabled = isCurrentMonth;
    }

    // Lundi-first : (getDay 0=Dim, 1=Lun…) → décalage
    const firstDay = new Date(y, m, 1).getDay(); // 0-6
    const leadingBlanks = (firstDay === 0) ? 6 : firstDay - 1;
    const daysInMonth = new Date(y, m + 1, 0).getDate();

    let html = '';
    for (let i = 0; i < leadingBlanks; i++) {
      html += `<span class="resa-cal-day is-empty" aria-hidden="true"></span>`;
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date    = new Date(y, m, d);
      const isPast  = date < today;
      const isSun   = date.getDay() === 0;
      const isToday = date.getTime() === today.getTime();
      const iso     = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const disabled = isPast || isSun;
      const selected = state.date === iso;
      const classes  = [
        'resa-cal-day',
        disabled ? 'is-disabled' : '',
        isToday  ? 'is-today'    : '',
        selected ? 'is-selected' : '',
      ].filter(Boolean).join(' ');
      html += `<button type="button" class="${classes}" data-day="${iso}" ${disabled ? 'aria-disabled="true" tabindex="-1"' : ''}>${d}</button>`;
    }
    daysEl.innerHTML = html;

    daysEl.querySelectorAll('.resa-cal-day:not(.is-disabled):not(.is-empty)').forEach(btn => {
      btn.addEventListener('click', () => selectDate(btn.dataset.day));
    });
  }

  function selectDate(iso) {
    state.date = iso;
    state.slot = null;  // reset
    renderCalendar();
    renderSlots();
    updateProgress();
  }

  function renderSlots() {
    const slotsEl = $('[data-slots]');
    const labelEl = $('[data-slots-label]');
    if (!slotsEl) return;

    if (!state.date) {
      slotsEl.innerHTML = '';
      if (labelEl) labelEl.textContent = 'Choisissez d\'abord une date.';
      return;
    }

    if (labelEl) labelEl.textContent = `Créneaux pour ${fmtDateFr(state.date)} :`;

    // Générer 9h00 → 18h30 par 30min = 20 créneaux
    const slots = [];
    for (let h = 9; h <= 18; h++) {
      slots.push(`${String(h).padStart(2, '0')}:00`);
      slots.push(`${String(h).padStart(2, '0')}:30`);
    }
    // 30% indisponibles, déterministe par date (pour rester stable au re-render)
    const seed = state.date.split('-').reduce((a, b) => a + Number(b), 0);
    const rand = (i) => ((seed * 9301 + i * 49297) % 233280) / 233280;

    slotsEl.innerHTML = slots.map((t, i) => {
      const disabled = rand(i) < 0.3;
      const selected = state.slot === t;
      const cls = [
        'resa-slot',
        disabled ? 'is-disabled' : '',
        selected ? 'is-selected' : '',
      ].filter(Boolean).join(' ');
      return `<button type="button" class="${cls}" role="radio" aria-checked="${selected}" ${disabled ? 'aria-disabled="true" tabindex="-1"' : ''} data-slot="${t}">${t}</button>`;
    }).join('');

    slotsEl.querySelectorAll('.resa-slot:not(.is-disabled)').forEach(btn => {
      btn.addEventListener('click', () => selectSlot(btn.dataset.slot));
    });
  }

  function selectSlot(t) {
    state.slot = t;
    $$('.resa-slot').forEach(b => {
      const sel = b.dataset.slot === t;
      b.classList.toggle('is-selected', sel);
      b.setAttribute('aria-checked', sel ? 'true' : 'false');
    });
    updateProgress();
    smoothScrollTo('#step-4');
  }

  // ─────────────────────────────────────────────────────
  // STEP 4 — ESTHÉTICIENNES
  // ─────────────────────────────────────────────────────
  function initExperts() {
    $$('.resa-expert-card').forEach(card => {
      card.addEventListener('click', () => {
        state.expert = card.dataset.expert;
        $$('.resa-expert-card').forEach(c => {
          const sel = c === card;
          c.classList.toggle('is-selected', sel);
          c.setAttribute('aria-checked', sel ? 'true' : 'false');
        });
      });
    });
  }

  // ─────────────────────────────────────────────────────
  // STEP 5 — FORMULAIRE
  // ─────────────────────────────────────────────────────
  function initForm() {
    const form = $('#resaForm');
    if (!form) return;
    ['prenom', 'nom', 'telephone', 'email', 'message'].forEach(name => {
      const field = form.elements[name];
      if (!field) return;
      const stateKey = name === 'telephone' ? 'tel' : name;
      field.addEventListener('input', () => {
        state[stateKey] = field.value.trim();
        field.parentElement.classList.remove('has-error');
      });
    });
  }

  // ─────────────────────────────────────────────────────
  // STEP 6 — RÉCAP + CONFIRMATION
  // ─────────────────────────────────────────────────────
  function updateSummary() {
    const set = (sel, value) => { const el = $(sel); if (el) el.textContent = value || '—'; };

    set('[data-summary-prestation]',
        state.prestation ? PRESTATIONS[state.prestation].label : '—');
    set('[data-summary-soin]',
        state.soin ? `${state.soin.name} · ${state.soin.duree} · ${state.soin.prix}` : '—');
    set('[data-summary-datetime]',
        (state.date && state.slot)
          ? `${cap(fmtDateFr(state.date))} à ${state.slot.replace(':', 'h')}`
          : '—');
    set('[data-summary-expert]', EXPERTS[state.expert]?.label || 'Aucune préférence');

    const contact = [
      [state.prenom, state.nom].filter(Boolean).join(' '),
      state.tel,
      state.email,
    ].filter(Boolean).join(' · ') || '—';
    set('[data-summary-contact]', contact);

    const msgRow = $('[data-summary-message-row]');
    const msgEl  = $('[data-summary-message]');
    if (msgRow && msgEl) {
      if (state.message) {
        msgEl.textContent = state.message;
        msgRow.hidden = false;
      } else {
        msgRow.hidden = true;
      }
    }
  }

  function validate() {
    const errors = [];
    if (!state.prestation) errors.push('Choisissez une prestation (étape 01).');
    if (!state.soin)       errors.push('Choisissez un soin (étape 02).');
    if (!state.date || !state.slot) errors.push('Choisissez une date et un créneau (étape 03).');

    // Form fields
    const form = $('#resaForm');
    if (form) {
      [['prenom', 'f-prenom'], ['nom', 'f-nom'], ['telephone', 'f-tel'], ['email', 'f-email']]
        .forEach(([name, id]) => {
          const field = form.elements[name];
          const fieldWrap = $(`#${id}`)?.parentElement;
          if (!field) return;
          const valid = field.checkValidity() && field.value.trim() !== '';
          if (!valid) {
            errors.push(`Renseignez le champ « ${field.previousElementSibling?.textContent || name} ».`);
            fieldWrap?.classList.add('has-error');
          } else {
            fieldWrap?.classList.remove('has-error');
          }
        });
    }

    return errors;
  }

  function initConfirm() {
    const btn = $('[data-confirm]');
    const errEl = $('[data-recap-error]');
    if (!btn) return;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const errors = validate();
      if (errors.length) {
        if (errEl) {
          errEl.hidden = false;
          errEl.textContent = errors[0];
        }
        return;
      }
      if (errEl) { errEl.hidden = true; errEl.textContent = ''; }
      submitBooking();
    });
  }

  function submitBooking() {
    const data = {
      prestation: PRESTATIONS[state.prestation].label,
      soin:       `${state.soin.name} (${state.soin.duree}, ${state.soin.prix})`,
      date:       cap(fmtDateFr(state.date)),
      heure:      state.slot.replace(':', 'h'),
      expert:     EXPERTS[state.expert]?.label || 'Aucune préférence',
      prenom:     state.prenom,
      nom:        state.nom,
      telephone:  state.tel,
      email:      state.email,
      message:    state.message,
    };

    const subject = `Nouvelle réservation — ${data.prenom} ${data.nom} — ${data.date}`;
    const bodyLines = [
      `Bonjour,`,
      ``,
      `Je souhaite réserver le rendez-vous suivant :`,
      ``,
      `Prestation     : ${data.prestation}`,
      `Soin           : ${data.soin}`,
      `Date & heure   : ${data.date} à ${data.heure}`,
      `Esthéticienne  : ${data.expert}`,
      ``,
      `Mes coordonnées :`,
      `Prénom        : ${data.prenom}`,
      `Nom           : ${data.nom}`,
      `Téléphone     : ${data.telephone}`,
      `Email         : ${data.email}`,
    ];
    if (data.message) {
      bodyLines.push(``, `Message       :`, data.message);
    }
    bodyLines.push(``, `Merci,`, `${data.prenom} ${data.nom}`);

    const mailto = `mailto:contact@maisonlumiere.fr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;

    // Ouvre le client mail
    window.location.href = mailto;

    // Affiche l'écran de remerciement (et masque le récap pour éviter le double scroll)
    const thanks = $('#step-7');
    if (thanks) {
      thanks.hidden = false;
      requestAnimationFrame(() => {
        thanks.classList.add('is-revealed');
        smoothScrollTo('#step-7');
      });
    }
  }

  // ─────────────────────────────────────────────────────
  // SCROLL FLUIDE — utilise Lenis si dispo, sinon fallback
  // ─────────────────────────────────────────────────────
  function smoothScrollTo(target) {
    const el = (typeof target === 'string') ? $(target) : target;
    if (!el) return;
    const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 64;
    const top = el.getBoundingClientRect().top + window.pageYOffset - headerH;
    if (window.lenis && typeof window.lenis.scrollTo === 'function') {
      window.lenis.scrollTo(top, { duration: 1.0 });
    } else {
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  function initScrollLinks() {
    $$('[data-scroll-to]').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        smoothScrollTo('#' + a.dataset.scrollTo);
      });
    });
  }

  // ─────────────────────────────────────────────────────
  // OBSERVERS — reveal au scroll + chip active selon section visible
  // ─────────────────────────────────────────────────────
  function initObservers() {
    // Reveal au scroll
    const reveal = new IntersectionObserver((entries) => {
      entries.forEach(ent => {
        if (ent.isIntersecting) {
          ent.target.classList.add('is-revealed');
          reveal.unobserve(ent.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });

    $$('.resa-section').forEach(s => reveal.observe(s));

    // Chip active selon section visible (>50%)
    const stepSections = $$('[data-step-section]');
    const onScreen = new IntersectionObserver((entries) => {
      entries.forEach(ent => {
        if (ent.isIntersecting) {
          const step = Number(ent.target.dataset.stepSection);
          if (step) markStepActive(step);
        }
      });
    }, { rootMargin: `-40% 0px -40% 0px`, threshold: 0 });
    stepSections.forEach(s => onScreen.observe(s));

    // Met à jour le récap quand step 6 entre en vue
    const recap = $('#step-6');
    if (recap) {
      const recapObs = new IntersectionObserver((entries) => {
        entries.forEach(ent => {
          if (ent.isIntersecting) updateSummary();
        });
      }, { threshold: 0.1 });
      recapObs.observe(recap);
    }
  }

  // ─────────────────────────────────────────────────────
  // DEEP-LINK — ?prestation=lash → pré-sélection
  // ─────────────────────────────────────────────────────
  function initDeepLink() {
    const params = new URLSearchParams(window.location.search);
    const p = params.get('prestation');
    if (p && PRESTATIONS[p]) {
      // Petite tempo pour que la page soit peinte avant le scroll
      setTimeout(() => {
        selectPrestation(p);
      }, 100);
    }
  }

  // ─────────────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────────────
  function init() {
    initPrestations();
    renderSoins();
    initCalendar();
    renderSlots();
    initExperts();
    initForm();
    initConfirm();
    initScrollLinks();
    initObservers();
    initDeepLink();
    updateProgress();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
