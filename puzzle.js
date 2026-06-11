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
  var pieceDefs = [
    { d: 'M ' + R + ' 0 L 200 0' + emit(seamVTop, false) + emit(seamHLeft, true) + ' L 0 ' + R + ' Q 0 0 ' + R + ' 0 Z',
      fill: 'url(#pzAqua)', stroke: '#BFF1EE',
      from: { x: -360, y: -180, z: 320, rx: 70, ry: -80, rz: -45 } },
    { d: 'M 200 0 L ' + (400 - R) + ' 0 Q 400 0 400 ' + R + ' L 400 200' + emit(seamHRight, true) + emit(seamVTop, true) + ' Z',
      fill: 'url(#pzIce)', stroke: '#F2FCFC',
      from: { x: 320, y: -260, z: -520, rx: -85, ry: 60, rz: 50 } },
    { d: 'M 0 200' + emit(seamHLeft, false) + emit(seamVBottom, false) + ' L ' + R + ' 400 Q 0 400 0 ' + (400 - R) + ' L 0 200 Z',
      fill: 'url(#pzMint)', stroke: '#DCF7EB',
      from: { x: -300, y: 300, z: -380, rx: 95, ry: 45, rz: 65 } },
    { d: 'M 200 200' + emit(seamHRight, false) + ' L 400 ' + (400 - R) + ' Q 400 400 ' + (400 - R) + ' 400 L 200 400' + emit(seamVBottom, true) + ' Z',
      fill: 'url(#pzDeep)', stroke: '#9BDBD6',
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
    '<linearGradient id="pzAqua" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#A9EBE7"/><stop offset=".55" stop-color="#7BD4D0"/><stop offset="1" stop-color="#3F938F"/></linearGradient>' +
    '<linearGradient id="pzIce" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F0FBFB"/><stop offset=".55" stop-color="#B8E8E8"/><stop offset="1" stop-color="#7FBDBD"/></linearGradient>' +
    '<linearGradient id="pzMint" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#D2F4E5"/><stop offset=".55" stop-color="#9DDDC2"/><stop offset="1" stop-color="#5FAD8C"/></linearGradient>' +
    '<linearGradient id="pzDeep" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#79CCC7"/><stop offset=".55" stop-color="#479C97"/><stop offset="1" stop-color="#235E5A"/></linearGradient>' +
    '<filter id="pzDepth" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#000000" flood-opacity="0.5"/></filter>' +
    '</defs>';
  stage.appendChild(defsSvg);

  var pieces = pieceDefs.map(function (def) {
    var layer = document.createElement('div');
    layer.className = 'pz-layer';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '-70 -70 540 540');
    var p = document.createElementNS(NS, 'path');
    p.setAttribute('d', def.d);
    p.setAttribute('fill', def.fill);
    p.setAttribute('fill-opacity', '0.96');
    p.setAttribute('stroke', def.stroke);
    p.setAttribute('stroke-width', '3');
    p.setAttribute('stroke-linejoin', 'round');
    p.setAttribute('filter', 'url(#pzDepth)');
    svg.appendChild(p);
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
