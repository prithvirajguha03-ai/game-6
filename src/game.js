(function () {
  'use strict';

  var DIFFICULTY_CONFIG = {
    easy:   { label: 'Easy',   total: 4, radiusScale: 1.4 },
    normal: { label: 'Normal', total: 6, radiusScale: 1.0 },
    hard:   { label: 'Hard',   total: 8, radiusScale: 0.75 }
  };

  var DIFFERENCES = [
    { label: 'The sun',    x: 255, y: 40,  r: 30 },
    { label: 'A cloud',    x: 170, y: 22,  r: 20,
      a: '<g fill="#ffffff" opacity="0.95"><rect x="152" y="21" width="36" height="6" rx="3"/>' +
         '<circle cx="170" cy="22" r="9"/><circle cx="160" cy="24" r="6"/><circle cx="180" cy="24" r="6"/></g>' },
    { label: 'A bird',     x: 124, y: 52,  r: 18,
      a: '<path d="M110 54 Q117 44 124 54 Q131 44 138 54" fill="none" stroke="#334155" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' },
    { label: 'The apples', x: 42,  y: 90,  r: 24,
      a: '<circle cx="42" cy="84" r="3.2" fill="#e63946"/>' +
         '<circle cx="52" cy="91" r="3.2" fill="#e63946"/>' +
         '<circle cx="33" cy="93" r="3.2" fill="#e63946"/>' },
    { label: 'The window', x: 156, y: 97,  w: 24, h: 20,
      a: '<line x1="168" y1="100" x2="168" y2="113" stroke="#7a8ca0" stroke-width="2"/>' +
         '<line x1="160" y1="106.5" x2="176" y2="106.5" stroke="#7a8ca0" stroke-width="2"/>' },
    { label: 'A flower',   x: 262, y: 139, r: 18,
      stem: '<line x1="262" y1="150" x2="262" y2="141" stroke="#2e7d32" stroke-width="2"/>',
      a: '<circle cx="262" cy="139" r="5" fill="#e63946"/><circle cx="262" cy="139" r="1.8" fill="#fdf5df"/>' },
    { label: 'A butterfly',x: 80,  y: 104, r: 16,
      a: '<g transform="translate(80,104)">' +
           '<ellipse cx="-8" cy="-2" rx="8" ry="6" fill="#fbbf24" opacity="0.95"/>' +
           '<ellipse cx="8" cy="-2" rx="8" ry="6" fill="#fbbf24" opacity="0.95"/>' +
           '<ellipse cx="-6" cy="5" rx="5" ry="4" fill="#f59e0b"/>' +
           '<ellipse cx="6" cy="5" rx="5" ry="4" fill="#f59e0b"/>' +
           '<rect x="-2" y="-8" width="4" height="12" rx="2" fill="#475569"/>' +
         '</g>' },
    { label: 'The fence',  x: 255, y: 178, r: 14,
      a: '<g stroke="#a16207" stroke-linecap="round">' +
           '<line x1="248" y1="176" x2="248" y2="190" stroke-width="3"/>' +
           '<line x1="262" y1="176" x2="262" y2="190" stroke-width="3"/>' +
           '<path d="M243 179 H267" fill="none" stroke="#a16207" stroke-width="2"/>' +
         '</g>' }
  ];

  var panelA = document.getElementById('panelA');
  var panelB = document.getElementById('panelB');

  var els = {
    found: document.getElementById('foundCount'),
    total: document.getElementById('totalCount'),
    totalHint: document.getElementById('totalHint'),
    mistakes: document.getElementById('mistakeCount'),
    progress: document.getElementById('progressBar'),
    message: document.getElementById('message'),
    stats: document.getElementById('resultStats'),
    restart: document.getElementById('restartBtn'),
    playAgain: document.getElementById('playAgainBtn'),
    changeDifficulty: document.getElementById('changeDifficultyBtn'),
    changeResult: document.getElementById('changeResultBtn'),
    badge: document.getElementById('difficultyBadge')
  };

  var difficultyRoot = document.getElementById('difficultyRoot');
  var gameScreen = document.getElementById('gameScreen');

  var difficulty = 'normal';
  var activeCount = DIFFICULTY_CONFIG.normal.total;
  var radiusScale = 1;
  var activeDefs = [];

  var found = null;
  var mistakes = 0;
  var done = false;
  var flashTimers = { A: null, B: null };

  function fmt(n) {
    return Math.round(n * 100) / 100;
  }

  function sunRays() {
    var rays = '';
    for (var i = 0; i < 8; i++) {
      var a = (i * Math.PI) / 4;
      var x1 = 255 + Math.cos(a) * 21;
      var y1 = 40 + Math.sin(a) * 21;
      var x2 = 255 + Math.cos(a) * 28;
      var y2 = 40 + Math.sin(a) * 28;
      rays += '<line x1="' + fmt(x1) + '" y1="' + fmt(y1) + '" x2="' + fmt(x2) + '" y2="' + fmt(y2) + '" stroke="#f5a300" stroke-width="3" stroke-linecap="round"/>';
    }
    return rays;
  }

  function hotspotMarkup(d, i) {
    var shape = d.w
      ? '<rect x="' + d.x + '" y="' + d.y + '" width="' + d.w + '" height="' + d.h + '" rx="5"/>'
      : '<circle cx="' + d.x + '" cy="' + d.y + '" r="' + d.r + '"/>';
    return '<g class="hotspot" data-id="' + i + '" role="button" tabindex="0" aria-label="Difference ' + (i + 1) + ': ' + d.label + '" title="Difference ' + (i + 1) + ': ' + d.label + '">' + shape + '</g>';
  }

  function buildScene(variant) {
    var isA = variant === 'A';
    var skyId = 'skyGrad-' + variant;
    var grassId = 'grassGrad-' + variant;

    var hasSun = activeCount > 0 && isA;
    var hasCloud = activeCount > 1 && isA;
    var hasBird = activeCount > 2 && isA;
    var hasApples = activeCount > 3 && isA;
    var hasWindow = activeCount > 4 && isA;
    var hasFlower = activeCount > 5 && isA;
    var hasButterfly = activeCount > 6 && isA;
    var hasFence = activeCount > 7 && isA;

    var hotspots = '';
    for (var i = 0; i < activeDefs.length; i++) {
      hotspots += hotspotMarkup(activeDefs[i], i);
    }

    var scene =
      '<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Scene ' + variant + '">' +
        '<defs>' +
          '<linearGradient id="' + skyId + '" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0" stop-color="#9ed7ff"/><stop offset="1" stop-color="#eef9ff"/>' +
          '</linearGradient>' +
          '<linearGradient id="' + grassId + '" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0" stop-color="#8fd36e"/><stop offset="1" stop-color="#76c15e"/>' +
          '</linearGradient>' +
        '</defs>' +
        '<rect x="0" y="0" width="300" height="200" fill="url(#' + skyId + ')"/>' +

        '<g>' +
          (hasSun ? sunRays() : '') +
          '<circle cx="255" cy="40" r="16" fill="' + (isA ? '#ffd23b' : '#fff3c4') + '"/>' +
        '</g>' +

        '<g fill="#ffffff" opacity="0.95">' +
          '<rect x="64" y="40" width="36" height="8" rx="4"/>' +
          '<circle cx="78" cy="42" r="13"/>' +
          '<circle cx="65" cy="45" r="8"/>' +
          '<circle cx="92" cy="45" r="8"/>' +
        '</g>' +

        (hasCloud ? DIFFERENCES[1].a : '') +
        (hasBird ? DIFFERENCES[2].a : '') +

        '<rect x="0" y="148" width="300" height="52" fill="url(#' + grassId + ')"/>' +

        '<rect x="38" y="112" width="12" height="38" fill="#8b5a2b"/>' +
        '<circle cx="34" cy="96" r="22" fill="#4e9f4f"/>' +
        '<circle cx="54" cy="96" r="20" fill="#3f8e44"/>' +
        '<circle cx="44" cy="86" r="20" fill="#58ad55"/>' +
        (hasApples ? DIFFERENCES[3].a : '') +

        '<polygon points="148,90 232,90 190,46" fill="#d25434"/>' +
        '<rect x="156" y="60" width="9" height="18" fill="#8c4a31"/>' +
        '<rect x="154" y="57" width="11" height="3" fill="#6d3a23"/>' +

        '<rect x="152" y="88" width="76" height="62" fill="#f5dfb8"/>' +
        '<g>' +
          '<rect x="160" y="100" width="16" height="13" fill="#b8e0f7" stroke="#7a8ca0" stroke-width="1"/>' +
          (hasWindow ? DIFFERENCES[4].a : '') +
        '</g>' +
        '<rect x="182" y="122" width="15" height="28" fill="#9c6b3c"/>' +
        '<circle cx="194" cy="137" r="1.8" fill="#ffd23b"/>' +

        '<circle cx="72" cy="147" r="9" fill="#3e7c3f"/>' +
        '<circle cx="130" cy="148" r="10" fill="#2f6e36"/>' +

        '<line x1="94" y1="150" x2="94" y2="144" stroke="#2e7d32" stroke-width="2"/>' +
        '<line x1="118" y1="150" x2="118" y2="136" stroke="#2e7d32" stroke-width="2"/>' +
        '<line x1="240" y1="150" x2="240" y2="142" stroke="#2e7d32" stroke-width="2"/>' +
        (hasFlower ? DIFFERENCES[5].stem : '') +

        '<circle cx="94" cy="142" r="5" fill="#e76f51"/><circle cx="94" cy="142" r="1.8" fill="#fdf5df"/>' +
        '<circle cx="118" cy="133" r="5" fill="#8e44ad"/><circle cx="118" cy="133" r="1.8" fill="#fdf5df"/>' +
        '<circle cx="240" cy="140" r="5" fill="#2a9d8f"/><circle cx="240" cy="140" r="1.8" fill="#fdf5df"/>' +
        (hasFlower ? DIFFERENCES[5].a : '') +

        (hasButterfly ? DIFFERENCES[6].a : '') +
        (hasFence ? DIFFERENCES[7].a : '') +

        hotspots +
        '<g class="js-markers"></g>' +
      '</svg>';

    return scene;
  }

  function markerCore(d, i) {
    var n = i + 1;
    var ring;
    var bx;
    var by;
    if (d.w) {
      bx = d.x + d.w + 7;
      by = d.y + d.h / 2;
      ring = '<rect x="' + (d.x + 1) + '" y="' + (d.y + 1) + '" width="' + (d.w - 2) + '" height="' + (d.h - 2) + '" rx="6" fill="rgba(16,185,129,0.18)" stroke="#10b981" stroke-width="3"/>';
    } else {
      bx = d.x + d.r * 0.75;
      by = d.y + d.r * 0.75;
      ring = '<circle cx="' + d.x + '" cy="' + d.y + '" r="' + d.r + '" fill="rgba(16,185,129,0.18)" stroke="#10b981" stroke-width="3"/>';
    }
    return '<g class="marker js-marker" data-id="' + i + '">' +
      ring +
      '<circle cx="' + bx + '" cy="' + by + '" r="8.5" fill="#10b981"/>' +
      '<text x="' + bx + '" y="' + by + '" text-anchor="middle" dominant-baseline="central" fill="#ffffff" font-size="12" font-weight="700">' + n + '</text>' +
    '</g>';
  }

  function replay(el, cls) {
    el.classList.remove(cls);
    el.getBoundingClientRect();
    el.classList.add(cls);
  }

  function renderPanels() {
    panelA.innerHTML = buildScene('A');
    panelB.innerHTML = buildScene('B');
  }

  function updateUI() {
    els.found.textContent = String(found.size);
    els.mistakes.textContent = String(mistakes);
    els.progress.style.width = (found.size / activeCount) * 100 + '%';
  }

  function addMarker(panel, id) {
    var layer = panel.querySelector('.js-markers');
    if (!layer) return;
    layer.insertAdjacentHTML('beforeend', markerCore(activeDefs[id], id));
    var last = layer.lastElementChild;
    if (last) replay(last, 'marker-pop');
  }

  function bumpMarker(id) {
    [panelA, panelB].forEach(function (panel) {
      panel.querySelectorAll('.js-marker[data-id="' + id + '"]').forEach(function (m) {
        replay(m, 'marker-pulse');
      });
    });
  }

  function registerMistake(panelKey) {
    mistakes += 1;
    updateUI();
    replay(els.mistakes, 'mis-bump');

    var panel = panelKey === 'A' ? panelA : panelB;
    clearTimeout(flashTimers[panelKey]);
    panel.classList.remove('mistake-flash');
    void panel.offsetWidth;
    panel.classList.add('mistake-flash');
    flashTimers[panelKey] = setTimeout(function () {
      panel.classList.remove('mistake-flash');
    }, 500);
  }

  function completeGame() {
    done = true;
    panelA.classList.add('game-done');
    panelB.classList.add('game-done');

    els.stats.textContent = mistakes === 0
      ? 'You found all ' + activeCount + ' differences without any mistakes!'
      : 'You found all ' + activeCount + ' differences with ' + mistakes + ' mistake' + (mistakes === 1 ? '' : 's') + '.';

    els.message.classList.remove('hidden');
    replay(els.message, 'completion-appear');
  }

  function markFound(id) {
    found.add(id);
    addMarker(panelA, id);
    addMarker(panelB, id);
    updateUI();
    if (found.size === activeCount) completeGame();
  }

  function handleHotspot(hotspot) {
    if (done) return;
    var id = Number(hotspot.getAttribute('data-id'));
    if (!isFinite(id) || id < 0 || id >= activeCount) return;
    if (found.has(id)) {
      bumpMarker(id);
      return;
    }
    markFound(id);
  }

  function onPanelClick(e) {
    var target = e.target;
    if (!target || typeof target.closest !== 'function') return;

    var hotspot = target.closest('.hotspot');
    if (hotspot) {
      handleHotspot(hotspot);
      return;
    }

    if (target.closest('svg')) {
      registerMistake(e.currentTarget === panelA ? 'A' : 'B');
    }
  }

  function onPanelKeydown(e) {
    if (done) return;
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var target = e.target;
    if (!target || typeof target.closest !== 'function') return;
    var hotspot = target.closest('.hotspot');
    if (!hotspot) return;
    e.preventDefault();
    handleHotspot(hotspot);
  }

  function buildActiveDefs() {
    activeDefs = [];
    for (var i = 0; i < activeCount; i++) {
      var d = DIFFERENCES[i];
      var copy = { label: d.label, x: d.x, y: d.y, a: d.a, stem: d.stem };
      if (d.r) copy.r = d.r * radiusScale;
      if (d.w) { copy.w = d.w; copy.h = d.h; }
      activeDefs.push(copy);
    }
  }

  function resetGame() {
    clearTimeout(flashTimers.A);
    clearTimeout(flashTimers.B);
    done = false;
    mistakes = 0;
    found = new Set();
    renderPanels();
    updateUI();
    els.message.classList.add('hidden');
    panelA.classList.remove('game-done', 'mistake-flash');
    panelB.classList.remove('game-done', 'mistake-flash');
  }

  function showDifficultyScreen() {
    gameScreen.classList.add('hidden');
    if (!selector) {
      selector = window.GameDifficulty.buildScreen(difficultyRoot, {
        eyebrow: 'Find the Difference',
        title: 'Choose Your Difficulty',
        intro: 'Spot what is different between the two pictures. First, choose how challenging today\u2019s activity should be, then press Start when you are ready.',
        descriptions: {
          easy: 'A relaxed pace with fewer things to spot',
          normal: 'A balanced, comfortable challenge',
          hard: 'More differences and smaller targets to find'
        },
        onStart: beginGame,
        onBack: function () {
          if (window.history.length > 1) {
            window.history.back();
          }
        }
      });
    } else {
      selector.setValue(difficulty);
    }
    selector.show();
  }

  function beginGame(level) {
    difficulty = window.GameDifficulty.normalize(level);
    var cfg = DIFFICULTY_CONFIG[difficulty];
    activeCount = cfg.total;
    radiusScale = cfg.radiusScale;
    buildActiveDefs();

    els.total.textContent = String(activeCount);
    els.totalHint.textContent = String(activeCount);
    els.badge.textContent = cfg.label;

    if (selector) selector.hide();
    gameScreen.classList.remove('hidden');

    resetGame();
  }

  var selector = null;

  els.restart.addEventListener('click', resetGame);
  els.playAgain.addEventListener('click', resetGame);
  els.changeDifficulty.addEventListener('click', showDifficultyScreen);
  els.changeResult.addEventListener('click', showDifficultyScreen);
  panelA.addEventListener('click', onPanelClick);
  panelB.addEventListener('click', onPanelClick);
  panelA.addEventListener('keydown', onPanelKeydown);
  panelB.addEventListener('keydown', onPanelKeydown);

  showDifficultyScreen();
})();