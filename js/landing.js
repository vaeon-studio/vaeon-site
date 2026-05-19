/* ============================================================
   LANDING · /beaute + /barber
   - Lazy-loading des iframes via IntersectionObserver
     (économise bande passante mobile, accélère le first paint)
   - Custom events Plausible déclarés explicitement
     (data-attributes lus automatiquement par script.tagged-events.js,
      cette section sert de filet de sécurité + fallback)
   ============================================================ */
(function(){
  'use strict';

  // ---------- LAZY-LOAD IFRAMES ----------
  // L'iframe a un attribut data-src au lieu de src.
  // Quand le wrapper entre dans le viewport, on swap data-src → src.
  var iframes = document.querySelectorAll('iframe[data-src]');
  if (!iframes.length) return;

  var loadIframe = function(iframe){
    if (iframe.src) return; // déjà chargé
    var src = iframe.getAttribute('data-src');
    if (!src) return;
    iframe.src = src;
    iframe.addEventListener('load', function(){
      iframe.classList.add('loaded');
      var frame = iframe.closest('.preview-frame');
      if (frame) frame.classList.add('is-loaded');
    }, { once: true });
  };

  if ('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting){
          var iframe = entry.target.querySelector('iframe[data-src]');
          if (iframe) loadIframe(iframe);
          io.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '300px 0px', // pré-charge 300px avant l'arrivée
      threshold: 0.01
    });

    document.querySelectorAll('.preview-frame').forEach(function(frame){
      io.observe(frame);
    });
  } else {
    // Fallback : chargement immédiat (navigateurs très anciens)
    iframes.forEach(loadIframe);
  }

  // ---------- PLAUSIBLE CUSTOM EVENTS (fallback explicite) ----------
  // Le script "tagged-events" lit déjà les data-plausible-event-name.
  // On ajoute ici un fallback manuel pour s'assurer du tracking
  // même si le script tagged n'est pas chargé.
  document.addEventListener('click', function(e){
    var el = e.target.closest('[data-plausible-event-name]');
    if (!el) return;
    var name = el.getAttribute('data-plausible-event-name');
    if (!name) return;
    if (typeof window.plausible === 'function'){
      // Si tagged-events l'a déjà envoyé, Plausible dédup côté serveur
      // mais pour éviter le double-comptage on n'appelle que si non-tagged.
      // Note : si tu utilises script.tagged-events.js, supprime ce bloc.
      // window.plausible(name);
    }
  }, { passive: true });

})();
