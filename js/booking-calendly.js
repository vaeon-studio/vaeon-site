/* ============================================================
   VAEON BOOKING — Calendly popup + Plausible tracking
   ------------------------------------------------------------
   - Charge le widget Calendly de manière non-bloquante (LCP-safe :
     les assets sont injectés en <link>/<script async> dans la page).
   - Délègue les clics sur [data-booking-source] pour ouvrir le popup.
   - Émet automatiquement un event Plausible (avec queue fallback
     si plausible() pas encore prêt).
   - Lit data-pageview-event sur <body> pour le tracking de vue.

   Conventions data-attributes :
     <body data-pageview-event="Essentielle viewed beaute">
     <button data-booking-source="niveau"
             data-booking-vertical="beaute"
             data-booking-niveau="essentielle">

     <button data-booking-source="landing"
             data-booking-vertical="beaute">    // niveau omis sur landings

   Events émis :
     - Pageview     → valeur de data-pageview-event sur <body>
     - Booking clic → "Calendly clicked from landing [vertical]"
                   ou "Calendly clicked from [Niveau] [vertical]"
   ============================================================ */
(function(){
  'use strict';

  // URL Calendly fournie par Maxime (incluant params hide_gdpr + primary_color sienne brûlée)
  var CALENDLY_URL = 'https://calendly.com/vaeon/decouverte?hide_gdpr_banner=1&primary_color=bd3f23';

  // Plausible queue fallback — si le script Plausible n'est pas encore chargé,
  // les events sont mis en queue et envoyés dès que possible.
  window.plausible = window.plausible || function(){
    (window.plausible.q = window.plausible.q || []).push(arguments);
  };

  function capitalize(str){
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  }

  function buildEventName(source, vertical, niveau){
    if (source === 'landing' && vertical){
      return 'Calendly clicked from landing ' + vertical;
    }
    if (source === 'niveau' && vertical && niveau){
      return 'Calendly clicked from ' + capitalize(niveau) + ' ' + vertical;
    }
    return 'Calendly clicked';
  }

  // ─── PAGEVIEW EVENT AU LOAD ──────────────────────────────
  function sendPageview(){
    var evName = document.body && document.body.getAttribute('data-pageview-event');
    if (evName) window.plausible(evName);
  }

  // ─── CLICK HANDLER DÉLÉGUÉ ───────────────────────────────
  function onClick(e){
    var btn = e.target && e.target.closest && e.target.closest('[data-booking-source]');
    if (!btn) return;
    e.preventDefault();

    var source   = btn.getAttribute('data-booking-source');
    var vertical = btn.getAttribute('data-booking-vertical');
    var niveau   = btn.getAttribute('data-booking-niveau');

    window.plausible(buildEventName(source, vertical, niveau));

    // Ouvre le popup Calendly. Fallback : ouvre l'URL si Calendly n'a pas chargé.
    if (window.Calendly && typeof window.Calendly.initPopupWidget === 'function'){
      window.Calendly.initPopupWidget({ url: CALENDLY_URL });
    } else {
      window.open(CALENDLY_URL, '_blank', 'noopener,noreferrer');
    }
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', sendPageview);
  } else {
    sendPageview();
  }
  document.addEventListener('click', onClick);
})();
