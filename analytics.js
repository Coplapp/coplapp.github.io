/**
 * Mätning för coplapp.com.
 *
 * Skriver till din egen Supabase - ingen tredje part, inga kakor, ingen IP,
 * inget om besökaren. Bara vilken sida som visades, vad som klickades och
 * varifrån besökaren kom. Det är därför löftet "inga trackers" fortfarande
 * håller: ingenting följer någon mellan sajter.
 *
 * Det finns ingen analyssida att bygga. Supabase-dashboarden är redan den:
 * inloggad, privat, med tabellvy och SQL. Det som saknades var insamlingen.
 *
 * Tabellen tillåter insert men inte select för anon-nyckeln, så den som läser
 * källkoden kan lägga till rader men aldrig hämta ut något.
 */
(function () {
  var BASE = 'https://acapdkovkusuewtertul.supabase.co/rest/v1';
  var KEY = 'sb_publishable_-rDlVpw5qq5NfXbpGY-ptw_mUg1kkuf';

  function send(event, target) {
    try {
      var body = JSON.stringify({
        event: event,
        path: location.pathname,
        target: target || null,
        // Bara domänen, inte hela adressen - en full URL kan bära sökord och
        // annat som inte är vår sak.
        referrer: document.referrer ? new URL(document.referrer).hostname : null,
        lang: (navigator.language || '').slice(0, 2),
      });

      // keepalive överlever att sidan lämnas, vilket ett klick på App Store
      // gör - utan den tappas just de klick vi helst vill räkna. Fetch och inte
      // sendBeacon: beacon kan inte sätta rubriker, och Supabase vill ha både
      // apikey och Authorization.
      fetch(BASE + '/site_events', {
        method: 'POST',
        keepalive: true,
        headers: {
          apikey: KEY,
          Authorization: 'Bearer ' + KEY,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: body,
      }).catch(function () {});
    } catch (e) {
      // Mätning får aldrig ta ner sidan.
    }
  }

  send('view');

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a, button');
    if (!a) return;

    var href = a.getAttribute('href') || '';
    if (href.indexOf('apps.apple.com') > -1) {
      // Var på sidan klicket skedde säger mer än att det skedde: hjälten,
      // partner-avsnittet eller avslutet.
      var where = a.closest('.hero') ? 'hero'
        : a.closest('.objection') ? 'partner'
        : a.closest('footer') ? 'footer'
        : 'slut';
      send('click', 'appstore-' + where);
      return;
    }
    if (a.classList.contains('swipe-arrow') || a.classList.contains('swipe-dot')) {
      send('click', 'swajp');
      return;
    }
    if (a.classList.contains('showcase-cta')) send('click', 'moduler');
    else if (a.closest('.faq')) send('click', 'fraga');
    else if (a.classList.contains('mm-chip')) send('click', 'modulchip');
  }, true);
})();
