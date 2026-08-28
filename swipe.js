/**
 * Swajpbara skärmar i mobilmockupen.
 *
 * Ersatte demofilmen. Filmen kunde inte stanna där besökaren blev nyfiken,
 * kunde inte förklara vad man tittade på, och måste spelas in på nytt varje
 * gång en skärm i appen ändrades.
 *
 * Ingen bunt, inget bibliotek - sajten är statiska filer och det här är
 * transform på ett spår.
 */
(function () {
  var wrap = document.querySelector('[data-swipe]');
  if (!wrap) return;

  var track = wrap.querySelector('.swipe-track');
  var screens = wrap.querySelectorAll('.screen');
  var dots = document.querySelectorAll('.swipe-dot');
  /**
   * Bildtexten under telefonen.
   *
   * En enda rad som byts, i stället för en text per skärmbild. Ovanpå bilden
   * dolde texten skärmens nedersta femtedel - alltså just det besökaren kom
   * för att titta på. Texterna bor kvar på varje figure som data-attribut.
   */
  var caption = document.querySelector('[data-caption]');
  var arrows = document.querySelectorAll('.swipe-arrow');
  var count = screens.length;
  if (count < 2) return;

  var index = 0;
  var timer = null;
  /**
   * Autoväxlingen slutar för gott när besökaren själv tagit över.
   *
   * Rörelsen finns för att dra blicken till mobilen vid sidladdning. Den som
   * börjat leta själv vill inte att bilden byts under fingret.
   */
  var userTook = false;

  function render() {
    track.style.transform = 'translateX(' + (-index * 100) + '%)';
    for (var i = 0; i < count; i++) {
      screens[i].setAttribute('aria-hidden', i === index ? 'false' : 'true');
      if (dots[i]) dots[i].classList.toggle('is-on', i === index);
    }
    if (caption) {
      var cur = screens[index];
      caption.querySelector('strong').textContent = cur.getAttribute('data-title') || '';
      caption.querySelector('span').textContent = cur.getAttribute('data-text') || '';
    }
  }

  function go(next, byUser) {
    index = (next + count) % count;
    if (byUser) stop();
    render();
  }

  function stop() {
    userTook = true;
    if (timer) { clearInterval(timer); timer = null; }
  }

  for (var d = 0; d < dots.length; d++) {
    (function (btn) {
      btn.addEventListener('click', function () { go(parseInt(btn.dataset.go, 10), true); });
    })(dots[d]);
  }

  for (var a = 0; a < arrows.length; a++) {
    (function (btn) {
      btn.addEventListener('click', function () { go(index + parseInt(btn.dataset.step, 10), true); });
    })(arrows[a]);
  }

  // Dra med finger eller mus. Pointer-events täcker båda.
  var startX = 0;
  var dragging = false;

  wrap.addEventListener('pointerdown', function (e) {
    dragging = true;
    startX = e.clientX;
    track.classList.add('is-dragging');
    wrap.setPointerCapture(e.pointerId);
  });

  wrap.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var dx = e.clientX - startX;
    var pct = (dx / wrap.offsetWidth) * 100;
    track.style.transform = 'translateX(' + (-index * 100 + pct) + '%)';
  });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    track.classList.remove('is-dragging');
    var dx = e.clientX - startX;
    // En fjärdedel av bredden räknas som ett byte. Mindre än så är en
    // felträff eller en scroll som råkade börja på bilden.
    if (Math.abs(dx) > wrap.offsetWidth / 4) {
      go(index + (dx < 0 ? 1 : -1), true);
    } else {
      render();
    }
  }

  wrap.addEventListener('pointerup', endDrag);
  wrap.addEventListener('pointercancel', function () {
    dragging = false;
    track.classList.remove('is-dragging');
    render();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') go(index + 1, true);
    if (e.key === 'ArrowLeft') go(index - 1, true);
  });

  render();

  // Långsam växling så mobilen lever vid sidladdning. Respekterar den som
  // bett systemet om mindre rörelse.
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!still) {
    timer = setInterval(function () {
      if (!userTook && !document.hidden) go(index + 1, false);
    }, 4200);
  }
})();
