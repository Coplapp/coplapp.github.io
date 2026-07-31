/* ============================================================
   COPL - SCROLLPUSSLET
   Fyra pusselbitar som tumlar in i 3D medan besökaren scrollar,
   landar med studs, och när de kopplas samman tonar plattan över
   till Copl-navy och logotypen kliver fram. Delas av sv/en-sidan.

   Geometrin: bitarna delar sömmar - varje söm definieras EN gång
   som kubiska bezier-segment och grannbiten kör samma segment
   baklänges, därför passar bitarna exakt.
   ============================================================ */
(function () {
  var root = document.querySelector('[data-puzzle]');
  if (!root) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Pusselgeometri ---------- */
  function knobV(ax, a, b, yc, dir) {
    var w = 22, d = 40, r = 34;
    return [
      [[ax, a], [ax, a + 4], [ax, yc - w - 14], [ax, yc - w]],
      [[ax, yc - w], [ax, yc - w + 16], [ax + dir * d, yc - r + 6], [ax + dir * d, yc]],
      [[ax + dir * d, yc], [ax + dir * d, yc + r - 6], [ax, yc + w - 16], [ax, yc + w]],
      [[ax, yc + w], [ax, yc + w + 14], [ax, b - 4], [ax, b]],
    ];
  }
  function knobH(ay, a, b, xc, dir) {
    var w = 22, d = 40, r = 34;
    return [
      [[a, ay], [a + 4, ay], [xc - w - 14, ay], [xc - w, ay]],
      [[xc - w, ay], [xc - w + 16, ay], [xc - r + 6, ay + dir * d], [xc, ay + dir * d]],
      [[xc, ay + dir * d], [xc + r - 6, ay + dir * d], [xc + w - 16, ay], [xc + w, ay]],
      [[xc + w, ay], [xc + w + 14, ay], [b - 4, ay], [b, ay]],
    ];
  }
  var seamVTop    = knobV(200, 0, 200, 100, 1);
  var seamVBottom = knobV(200, 200, 400, 300, -1);
  var seamHLeft   = knobH(200, 0, 200, 100, 1);
  var seamHRight  = knobH(200, 200, 400, 300, -1);

  function emit(segs, reverse) {
    var d = '', list = reverse ? segs.slice().reverse() : segs;
    for (var i = 0; i < list.length; i++) {
      var s = list[i];
      var c1 = reverse ? s[2] : s[1], c2 = reverse ? s[1] : s[2], p1 = reverse ? s[0] : s[3];
      d += ' C ' + c1[0] + ' ' + c1[1] + ', ' + c2[0] + ' ' + c2[1] + ', ' + p1[0] + ' ' + p1[1];
    }
    return d;
  }

  var R = 28;

  /* Bokstäverna sitter i bitarna: C uppe vänster, O uppe höger, P nere
     vänster, L nere höger. Sätt `letter: null` på en bit för att stänga av
     dess bokstav utan att röra något annat. Färgen väljs per bit så
     Alla fyra har samma mörka navy - önskat 2026-07-31. L:en satt tidigare i
     ljust eftersom dess bit är mörkast; därför är den bitens gradient nu
     ljusare i mitten så bokstaven fortfarande går att läsa. */
  var pieceDefs = [
    { d: 'M ' + R + ' 0 L 200 0' + emit(seamVTop, false) + emit(seamHLeft, true) + ' L 0 ' + R + ' Q 0 0 ' + R + ' 0 Z',
      fill: 'url(#pzAqua)', stroke: '#E8FFFD',
      letter: 'C', lx: 96, ly: 104, letterFill: '#08222B', letterOpacity: 0.8,
      from: { x: -360, y: -180, z: 320, rx: 70, ry: -80, rz: -45 } },
    { d: 'M 200 0 L ' + (400 - R) + ' 0 Q 400 0 400 ' + R + ' L 400 200' + emit(seamHRight, true) + emit(seamVTop, true) + ' Z',
      fill: 'url(#pzIce)', stroke: '#FFFFFF',
      letter: 'O', lx: 302, ly: 104, letterFill: '#08222B', letterOpacity: 0.76,
      from: { x: 320, y: -260, z: -520, rx: -85, ry: 60, rz: 50 } },
    { d: 'M 0 200' + emit(seamHLeft, false) + emit(seamVBottom, false) + ' L ' + R + ' 400 Q 0 400 0 ' + (400 - R) + ' L 0 200 Z',
      fill: 'url(#pzMint)', stroke: '#EDFFF7',
      letter: 'P', lx: 98, ly: 304, letterFill: '#08222B', letterOpacity: 0.8,
      from: { x: -300, y: 300, z: -380, rx: 95, ry: 45, rz: 65 } },
    { d: 'M 200 200' + emit(seamHRight, false) + ' L 400 ' + (400 - R) + ' Q 400 400 ' + (400 - R) + ' 400 L 200 400' + emit(seamVBottom, true) + ' Z',
      fill: 'url(#pzDeep)', stroke: '#8FE9E4',
      letter: 'L', lx: 302, ly: 304, letterFill: '#08222B', letterOpacity: 0.8,
      from: { x: 380, y: 220, z: 420, rx: -60, ry: -95, rz: -55 } },
  ];

  /* ---------- Bygg SVG-innehållet ---------- */
  var NS = 'http://www.w3.org/2000/svg';
  var stage = root.querySelector('.pz-stage');

  // Delade gradienter + skuggfilter (göms i en 0x0-svg)
  var defsSvg = document.createElementNS(NS, 'svg');
  defsSvg.setAttribute('width', '0'); defsSvg.setAttribute('height', '0');
  defsSvg.style.position = 'absolute';
  defsSvg.innerHTML =
    '<defs>' +
    /* Mättade gradienter med större spann. De gamla var ljusa pasteller som
       dessutom låg på fill-opacity 0.96, så navyn lyste igenom och drog ner
       kulören - bitarna blev grådaskiga mot bakgrunden. */
    '<linearGradient id="pzAqua" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C4FFFB"/><stop offset=".45" stop-color="#5FD8D2"/><stop offset="1" stop-color="#17807B"/></linearGradient>' +
    '<linearGradient id="pzIce" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".45" stop-color="#BDF2F2"/><stop offset="1" stop-color="#4FA5A5"/></linearGradient>' +
    '<linearGradient id="pzMint" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E4FFF2"/><stop offset=".45" stop-color="#6FDCB4"/><stop offset="1" stop-color="#1E8862"/></linearGradient>' +
    /* Ljusare mitt och botten än de övriga fick, så den mörka L:en går att
       läsa. Den är fortfarande tydligt setets mörkaste bit. */
    '<linearGradient id="pzDeep" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7BE0DA"/><stop offset=".45" stop-color="#31B0A9"/><stop offset="1" stop-color="#12706B"/></linearGradient>' +
    /* Dagerstrimma längs överkanten inuti biten - ger plastglans. */
    '<linearGradient id="pzSheen" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".34"/><stop offset=".3" stop-color="#FFFFFF" stop-opacity=".05"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>' +
    /* Fasning: feSpecularLighting på biten egen alfa ger en riktig upphöjd
       kant med ljus uppifrån vänster, i stället för bara en skugga under.
       Sedan två skuggor - en mjuk för höjd, en tät för kontakt mot ytan. */
    '<filter id="pzDepth" x="-45%" y="-45%" width="190%" height="190%">' +
      '<feGaussianBlur in="SourceAlpha" stdDeviation="7" result="pzBlur"/>' +
      /* Dämpad specular. Full styrka blekte de ljusa bitarna vita - fasningen
         ska antyda höjd, inte lägga en vit slöja över kulören. */
      '<feSpecularLighting in="pzBlur" surfaceScale="4" specularConstant="0.5" specularExponent="26" lighting-color="#FFFFFF" result="pzSpec">' +
        '<fePointLight x="-120" y="-200" z="300"/>' +
      '</feSpecularLighting>' +
      '<feComposite in="pzSpec" in2="SourceAlpha" operator="in" result="pzSpecIn"/>' +
      '<feComposite in="SourceGraphic" in2="pzSpecIn" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="pzLit"/>' +
      '<feDropShadow in="pzLit" dx="0" dy="22" stdDeviation="20" flood-color="#000208" flood-opacity="0.62" result="pzS1"/>' +
      '<feDropShadow in="pzS1" dx="0" dy="4" stdDeviation="3" flood-color="#000208" flood-opacity="0.5"/>' +
    '</filter>' +
    '</defs>';
  stage.appendChild(defsSvg);

  var pieces = pieceDefs.map(function (def) {
    var layer = document.createElement('div');
    layer.className = 'pz-layer';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '-70 -70 540 540');

    // Bit + glans ligger i samma grupp så fasnings-filtret räknar på formens
    // alfa. Full opacitet nu - navyn ska inte lysa igenom och blekna kulören.
    var g = document.createElementNS(NS, 'g');
    g.setAttribute('filter', 'url(#pzDepth)');

    var p = document.createElementNS(NS, 'path');
    p.setAttribute('d', def.d);
    p.setAttribute('fill', def.fill);
    p.setAttribute('stroke', def.stroke);
    p.setAttribute('stroke-width', '2.5');
    p.setAttribute('stroke-linejoin', 'round');
    g.appendChild(p);

    var sheen = document.createElementNS(NS, 'path');
    sheen.setAttribute('d', def.d);
    sheen.setAttribute('fill', 'url(#pzSheen)');
    sheen.setAttribute('stroke', 'none');
    sheen.setAttribute('pointer-events', 'none');
    g.appendChild(sheen);

    svg.appendChild(g);

    // Bokstaven ligger UTANFÖR filtret - annars tvättar glansen ur den.
    // paint-order stroke ger en tunn ljus kontur som lyfter den från ytan.
    if (def.letter) {
      var tx = document.createElementNS(NS, 'text');
      tx.setAttribute('x', String(def.lx));
      tx.setAttribute('y', String(def.ly));
      tx.setAttribute('text-anchor', 'middle');
      tx.setAttribute('dominant-baseline', 'central');
      tx.setAttribute('font-family', "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif");
      tx.setAttribute('font-size', '112');
      tx.setAttribute('font-weight', '700');
      tx.setAttribute('letter-spacing', '-2');
      tx.setAttribute('fill', def.letterFill);
      tx.setAttribute('fill-opacity', String(def.letterOpacity));
      tx.setAttribute('stroke', 'rgba(255,255,255,0.28)');
      tx.setAttribute('stroke-width', '2');
      tx.setAttribute('paint-order', 'stroke');
      tx.setAttribute('pointer-events', 'none');
      tx.textContent = def.letter;
      svg.appendChild(tx);
    }

    layer.appendChild(svg);
    stage.insertBefore(layer, stage.querySelector('.pz-plate'));
    return { el: layer, from: def.from };
  });

  // Gnistor
  var sparkBox = root.querySelector('.pz-sparkles');
  for (var i = 0; i < 16; i++) {
    var s = document.createElement('i');
    s.style.setProperty('--a', (i * 22.5 + (i % 2) * 9) + 'deg');
    s.style.setProperty('--i', i);
    sparkBox.appendChild(s);
  }

  /* ---------- Scroll-koreografi ---------- */
  var title = root.querySelector('.pz-title');
  var sloganSpans = root.querySelectorAll('.pz-slogan span');

  function easeOutBack(t) {
    var c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }
  function smooth(t) { return t * t * (3 - 2 * t); }

  var ticking = false;
  function update() {
    ticking = false;
    var rect = root.getBoundingClientRect();
    var total = rect.height - window.innerHeight;
    var t = total > 0 ? -rect.top / total : 1;
    t = Math.max(0, Math.min(1, t));
    var ease = smooth(t);

    var tilt = 42 - 36 * ease;
    var sway = 10 - 10 * ease;
    var grow = 0.86 + 0.14 * ease;
    stage.style.transform = 'rotateX(' + tilt + 'deg) rotateZ(' + sway + 'deg) scale(' + grow + ')';

    for (var i = 0; i < pieces.length; i++) {
      var lt = Math.max(0, Math.min(1, (ease - i * 0.13) / 0.5));
      var le = lt >= 1 ? 1 : (lt <= 0 ? 0 : easeOutBack(lt));
      var inv = 1 - le;
      var f = pieces[i].from;
      pieces[i].el.style.transform =
        'translate3d(' + f.x * inv + 'px,' + f.y * inv + 'px,' + f.z * inv + 'px) ' +
        'rotateX(' + f.rx * inv + 'deg) rotateY(' + f.ry * inv + 'deg) rotateZ(' + f.rz * inv + 'deg)';
      pieces[i].el.style.opacity = String(Math.min(1, 0.15 + 1.1 * lt));
    }

    var done = ease > 0.94;
    stage.classList.toggle('pz-done', done);
    if (title) title.style.opacity = done ? '0.35' : '1';
    for (var j = 0; j < sloganSpans.length; j++) {
      sloganSpans[j].classList.toggle('lit', ease > 0.6 + j * 0.11);
    }
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }

  if (reduced) {
    stage.style.transform = 'none';
    pieces.forEach(function (p) { p.el.style.transform = 'none'; p.el.style.opacity = '1'; });
    stage.classList.add('pz-done');
    for (var k = 0; k < sloganSpans.length; k++) sloganSpans[k].classList.add('lit');
  } else {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }
})();
