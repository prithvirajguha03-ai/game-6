(function () {
  'use strict';

  var DIFFICULTY_CONFIG = {
    easy:   { label: 'Easy',   radiusScale: 1.5 },
    normal: { label: 'Normal', radiusScale: 1.0 },
    hard:   { label: 'Hard',   radiusScale: 0.72 }
  };

  var ROUNDS = [
    {
      id: 'beach',
      name: 'Beach Day',
      differences: [
        { label: 'A seagull in the sky', x: 72, y: 54, r: 18 },
        { label: 'The beach ball colors', x: 48, y: 165, r: 17 },
        { label: 'A starfish on the sand', x: 98, y: 178, r: 16 },
        { label: 'The sailboat sail', x: 150, y: 116, r: 24 }
      ]
    },
    {
      id: 'street',
      name: 'Cozy Street',
      differences: [
        { label: 'The roof color', x: 135, y: 76, r: 26 },
        { label: 'A cat by the door', x: 150, y: 143, r: 15 },
        { label: 'The chimney', x: 106, y: 64, r: 15 },
        { label: 'The dog', x: 56, y: 163, r: 15, bx: 230, by: 165, br: 15 },
        { label: 'A window crossbar', x: 167, y: 107, r: 13 }
      ]
    },
    {
      id: 'space',
      name: 'Starry Night',
      differences: [
        { label: 'The moon', x: 240, y: 44, r: 26 },
        { label: 'A bright star', x: 118, y: 66, r: 14 },
        { label: 'A shooting star', x: 86, y: 112, r: 15 },
        { label: 'The planet Saturn', x: 190, y: 130, r: 19 },
        { label: 'The rocket', x: 60, y: 150, r: 17, bx: 214, by: 150, br: 17 }
      ]
    },
    {
      id: 'garden',
      name: 'Garden Blooms',
      differences: [
        { label: 'The flower color', x: 150, y: 114, r: 18 },
        { label: 'A leaf on the stem', x: 227, y: 134, r: 13 },
        { label: 'The butterfly', x: 60, y: 82, r: 16, bx: 236, by: 92, br: 16 },
        { label: 'A little bird', x: 142, y: 66, r: 15 },
        { label: 'The petal size', x: 70, y: 122, r: 18 }
      ]
    },
    {
      id: 'park',
      name: 'Park Fun',
      differences: [
        { label: 'The swing seat color', x: 100, y: 114, r: 15 },
        { label: 'The fountain shape', x: 150, y: 148, r: 20 },
        { label: 'The kite', x: 206, y: 84, r: 17, bx: 252, by: 56, br: 17 },
        { label: 'A park bench', x: 196, y: 155, r: 18 },
        { label: 'A cloud in the sky', x: 60, y: 46, r: 18 }
      ]
    },
    {
      id: 'market',
      name: 'Market Stall',
      differences: [
        { label: 'A missing awning stripe', x: 184, y: 58, r: 17 },
        { label: 'The crate size', x: 63, y: 179, r: 18 },
        { label: 'The potted plant', x: 100, y: 166, r: 17, bx: 252, by: 168, br: 17 },
        { label: 'A little dog', x: 32, y: 175, r: 14 },
        { label: 'The apples color', x: 170, y: 111, r: 18 }
      ]
    },
    {
      id: 'farm',
      name: 'Sunny Farm',
      differences: [
        { label: 'The barn door color', x: 96, y: 122, r: 18 },
        { label: 'The lamb', x: 60, y: 166, r: 20, bx: 206, by: 166, br: 20 },
        { label: 'The windmill blades', x: 252, y: 80, r: 23 },
        { label: 'A tractor', x: 150, y: 166, r: 21 },
        { label: 'The tree shape', x: 32, y: 112, r: 22 }
      ]
    },
    {
      id: 'camp',
      name: 'Camp Out',
      differences: [
        { label: 'The tent size', x: 96, y: 108, r: 22 },
        { label: 'The campfire smoke', x: 186, y: 92, r: 16 },
        { label: 'A hanging lantern', x: 266, y: 100, r: 15 },
        { label: 'The backpack', x: 120, y: 170, r: 15, bx: 244, by: 172, br: 15 },
        { label: 'The owl\u2019s eye', x: 250, y: 116, r: 18 }
      ]
    }
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
    badge: document.getElementById('difficultyBadge'),
    sceneBadge: document.getElementById('sceneBadge'),
    sceneName: document.getElementById('sceneName')
  };

  var difficultyRoot = document.getElementById('difficultyRoot');
  var gameScreen = document.getElementById('gameScreen');

  var difficulty = 'normal';
  var radiusScale = 1;
  var current = 0;
  var round = ROUNDS[0];

  var found = null;
  var mistakes = 0;
  var done = false;
  var flashTimers = { A: null, B: null };

  function fmt(n) {
    return Math.round(n * 100) / 100;
  }

  function grad(id, c0, c1) {
    return '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + c0 + '"/><stop offset="1" stop-color="' + c1 + '"/>' +
    '</linearGradient>';
  }

  function sunMarkup(cx, cy) {
    var s = '';
    for (var i = 0; i < 8; i++) {
      var a = (i * Math.PI) / 4;
      s += '<line x1="' + fmt(cx + Math.cos(a) * 14) + '" y1="' + fmt(cy + Math.sin(a) * 14) +
           '" x2="' + fmt(cx + Math.cos(a) * 20) + '" y2="' + fmt(cy + Math.sin(a) * 20) +
           '" stroke="#f59e00" stroke-width="3" stroke-linecap="round"/>';
    }
    return s;
  }

  function cloudMarkup(cx, cy, sc) {
    return '<g fill="#ffffff" opacity="0.95">' +
      '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + (20 * sc) + '" ry="' + (8.5 * sc) + '"/>' +
      '<circle cx="' + (cx - 13 * sc) + '" cy="' + (cy + 2 * sc) + '" r="' + (8 * sc) + '"/>' +
      '<circle cx="' + (cx + 13 * sc) + '" cy="' + (cy + 2 * sc) + '" r="' + (8 * sc) + '"/>' +
      '<circle cx="' + cx + '" cy="' + (cy - 6 * sc) + '" r="' + (10 * sc) + '"/>' +
    '</g>';
  }

  function starPts(cx, cy, ro, ri) {
    var pts = [];
    for (var i = 0; i < 10; i++) {
      var rpt = i % 2 === 0 ? ro : ri;
      var a = (i * Math.PI) / 5 - Math.PI / 2;
      pts.push(fmt(cx + Math.cos(a) * rpt) + ',' + fmt(cy + Math.sin(a) * rpt));
    }
    return pts.join(' ');
  }

  function petalsMarkup(cx, cy, petalR, color) {
    var s = '';
    for (var i = 0; i < 5; i++) {
      var a = (i * 2 * Math.PI) / 5;
      s += '<circle cx="' + fmt(cx + Math.cos(a) * 6) + '" cy="' + fmt(cy + Math.sin(a) * 6) +
           '" r="' + petalR + '" fill="' + color + '"/>';
    }
    return s + '<circle cx="' + cx + '" cy="' + cy + '" r="2.6" fill="#fdf5df"/>';
  }

  function butterflyMarkup(X, Y) {
    return '<g transform="translate(' + X + ',' + Y + ')">' +
      '<ellipse cx="-8" cy="-2" rx="8" ry="6" fill="#fbbf24" opacity="0.95"/>' +
      '<ellipse cx="8" cy="-2" rx="8" ry="6" fill="#fbbf24" opacity="0.95"/>' +
      '<ellipse cx="-6" cy="5" rx="5" ry="4" fill="#f59e0b"/>' +
      '<ellipse cx="6" cy="5" rx="5" ry="4" fill="#f59e0b"/>' +
      '<rect x="-2" y="-8" width="4" height="12" rx="2" fill="#475569"/>' +
    '</g>';
  }

  function dogMarkup(X, Y) {
    return '<g transform="translate(' + X + ',' + Y + ')">' +
      '<rect x="-8" y="-4" width="16" height="7" rx="3.5" fill="#a16207"/>' +
      '<circle cx="-7" cy="-6" r="3.5" fill="#a16207"/>' +
      '<ellipse cx="-7" cy="-6" rx="3" ry="2.6" fill="#7a4a28"/>' +
      '<path d="M-9 -8 l-3 -3 M-9 -8 l-1 -3" stroke="#7a4a28" fill="none" stroke-width="1.5" stroke-linecap="round"/>' +
      '<path d="M7 -3 q5 -5 3 -9" stroke="#a16207" fill="none" stroke-width="2" stroke-linecap="round"/>' +
      '<rect x="-6" y="3" width="2.6" height="5" rx="1" fill="#a16207"/>' +
      '<rect x="0" y="3" width="2.6" height="5" rx="1" fill="#a16207"/>' +
    '</g>';
  }

  function catMarkup(X, Y) {
    return '<g transform="translate(' + X + ',' + Y + ')">' +
      '<ellipse cx="-1" cy="1" rx="8" ry="6" fill="#8a613f"/>' +
      '<circle cx="2" cy="-6" r="5" fill="#8a613f"/>' +
      '<path d="M-1 -10 l-3 -5 M5 -10 l3 -5" stroke="#8a613f" fill="none" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M-8 3 Q-11 8 -5 8" stroke="#8a613f" fill="none" stroke-width="2" stroke-linecap="round"/>' +
      '<rect x="-4" y="4" width="2.4" height="4" rx="1" fill="#6f4a2b"/>' +
      '<rect x="2" y="4" width="2.4" height="4" rx="1" fill="#6f4a2b"/>' +
    '</g>';
  }

  function sheepMarkup(X, Y) {
    return '<g transform="translate(' + X + ',' + Y + ')">' +
      '<ellipse cx="0" cy="-2" rx="11" ry="8" fill="#f8fafc"/>' +
      '<circle cx="-9" cy="-7" r="4.5" fill="#334155"/>' +
      '<circle cx="-11" cy="-8" r="1" fill="#0f172a"/>' +
      '<path d="M-11 -10 l-2 -3 M-11 -10 l2 -3" stroke="#334155" fill="none" stroke-width="1.5" stroke-linecap="round"/>' +
      '<rect x="-6" y="6" width="2.6" height="5" rx="1" fill="#94a3b8"/>' +
      '<rect x="3" y="6" width="2.6" height="5" rx="1" fill="#94a3b8"/>' +
    '</g>';
  }

  function rocketMarkup(X, Y) {
    return '<g transform="translate(' + X + ',' + Y + ')">' +
      '<path d="M0 -8 L5 0 L-5 0 Z" fill="#ef4444"/>' +
      '<rect x="-5" y="0" width="10" height="9" rx="2" fill="#e2e8f0"/>' +
      '<circle cx="0" cy="3" r="2.6" fill="#3b82f6"/>' +
      '<path d="M-5 5 L-9 11 L-5 9 Z" fill="#ef4444"/>' +
      '<path d="M5 5 L9 11 L5 9 Z" fill="#ef4444"/>' +
      '<path d="M-3 9 L0 15 L3 9 Z" fill="#f97316"/>' +
    '</g>';
  }

  function tractorMarkup(X, Y) {
    return '<g transform="translate(' + X + ',' + Y + ')">' +
      '<rect x="-15" y="-3" width="26" height="13" rx="3" fill="#db4c33"/>' +
      '<rect x="5" y="-7" width="8" height="5" rx="2" fill="#26313c"/>' +
      '<line x1="10" y1="-3" x2="10" y2="-10" stroke="#64748b" stroke-width="2"/>' +
      '<circle cx="-5" cy="8" r="7" fill="#1f2937"/>' +
      '<circle cx="-5" cy="8" r="3" fill="#9ca3af"/>' +
      '<circle cx="7" cy="7" r="4.5" fill="#1f2937"/>' +
      '<circle cx="7" cy="7" r="2" fill="#9ca3af"/>' +
    '</g>';
  }

  function kiteMarkup(X, Y) {
    return '<g transform="translate(' + X + ',' + Y + ')">' +
      '<polygon points="0,-14 10,0 0,14 -10,0" fill="#f59e0b"/>' +
      '<path d="M-10 0 L10 0 M0 -14 L0 14" stroke="#ffffff" stroke-width="1.2" opacity="0.85"/>' +
      '<path d="M0 13 q5 7 0 11 M0 24 q-5 6 0 11" stroke="#f59e0b" fill="none" stroke-width="1.5"/>' +
    '</g>';
  }

  function birdMarkup(X, Y) {
    return '<g transform="translate(' + X + ',' + Y + ')">' +
      '<ellipse cx="-1" cy="0" rx="5.5" ry="3.8" fill="#334155"/>' +
      '<circle cx="6" cy="-2" r="3.2" fill="#334155"/>' +
      '<path d="M7 -4 l2 -3 M5 -5 l-1 -3" stroke="#334155" fill="none" stroke-width="1.5" stroke-linecap="round"/>' +
      '<path d="M-5 2 Q-9 6 -7 10 l1 -1 Q-4 7 -2 3 Z" fill="#475569"/>' +
    '</g>';
  }

  function lanternMarkup(X, Y) {
    return '<g transform="translate(' + X + ',' + Y + ')">' +
      '<line x1="0" y1="13" x2="0" y2="2" stroke="#64748b" stroke-width="1.5"/>' +
      '<rect x="-6" y="0" width="12" height="15" rx="2" fill="#f59e0b"/>' +
      '<rect x="-3" y="3" width="6" height="9" fill="#fff7cc"/>' +
      '<rect x="-6" y="-3" width="12" height="4" rx="1.5" fill="#475569"/>' +
    '</g>';
  }

  function owlMarkup(X, Y, full) {
    var eyes = full
      ? '<circle cx="-3" cy="-5" r="2.6" fill="#fffbf2"/><circle cx="3" cy="-5" r="2.6" fill="#fffbf2"/>' +
        '<circle cx="-3" cy="-5" r="1.2" fill="#1f2937"/><circle cx="3" cy="-5" r="1.2" fill="#1f2937"/>'
      : '<circle cx="-3" cy="-5" r="2.6" fill="#fffbf2"/><circle cx="-3" cy="-5" r="1.2" fill="#1f2937"/>';
    return '<g transform="translate(' + X + ',' + Y + ')">' +
      '<path d="M-5 -10 l-3 -4 M5 -10 l3 -4" stroke="#8d6b4e" fill="none" stroke-width="2" stroke-linecap="round"/>' +
      '<circle cx="0" cy="-5" r="7" fill="#a0845c"/>' +
      '<ellipse cx="0" cy="2" rx="9" ry="8" fill="#8d6b4e"/>' +
      eyes +
      '<path d="M-1.5 -2 L1.5 -2 L0 0.6 Z" fill="#eab308"/>' +
      '<path d="M-9 2 q-5 6 -3 11" stroke="#7a5329" fill="none" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M9 2 q5 6 3 11" stroke="#7a5329" fill="none" stroke-width="3" stroke-linecap="round"/>' +
    '</g>';
  }

  function backpackMarkup(X, Y) {
    return '<g transform="translate(' + X + ',' + Y + ')">' +
      '<rect x="-10" y="-7" width="20" height="14" rx="4" fill="#7c5a3b"/>' +
      '<rect x="-4" y="-10" width="8" height="5" rx="2" fill="#9c7a5b"/>' +
      '<rect x="-10" y="1" width="20" height="6" rx="2" fill="#6b4a2f"/>' +
      '<path d="M-10 -7 q2 -7 20 0" stroke="#5d4037" fill="none" stroke-width="3" stroke-linecap="round"/>' +
    '</g>';
  }

  function plantMarkup(X, Y) {
    return '<g transform="translate(' + X + ',' + Y + ')">' +
      '<path d="M0 -4 Q-5 -18 -8 -23 Q-3 -16 0 -6 M0 -4 Q5 -20 9 -24 Q3 -16 1 -6 M0 -4 Q0 -21 0 -26" stroke="#2e7d32" stroke-width="2" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="-8" cy="-23" rx="4.5" ry="2.2" fill="#3f8e44" transform="rotate(-30 -8 -23)"/>' +
      '<ellipse cx="9" cy="-24" rx="4.5" ry="2.2" fill="#3f8e44" transform="rotate(25 9 -24)"/>' +
      '<rect x="-8" y="-2" width="16" height="11" rx="2.5" fill="#c0653f"/>' +
    '</g>';
  }

  function starfishMarkup(X, Y) {
    return '<polygon points="' + starPts(X, Y, 12, 5.2) + '" fill="#f97316" stroke="#c2540e" stroke-width="1.5"/>' +
      '<circle cx="' + X + '" cy="' + Y + '" r="1.6" fill="#c2540e"/>';
  }

  function geomFor(variant, diff) {
    if (variant === 'B' && diff.bx !== undefined && diff.bx !== null) {
      return diff.bw
        ? { x: diff.bx, y: diff.by, w: diff.bw, h: diff.bh }
        : { x: diff.bx, y: diff.by, r: diff.br * radiusScale };
    }
    return diff.w
      ? { x: diff.x, y: diff.y, w: diff.w, h: diff.h }
      : { x: diff.x, y: diff.y, r: diff.r * radiusScale };
  }

  function hotspotMarkup(variant, diff, i) {
    var g = geomFor(variant, diff);
    var shape = g.w
      ? '<rect x="' + g.x + '" y="' + g.y + '" width="' + g.w + '" height="' + g.h + '" rx="5"/>'
      : '<circle cx="' + g.x + '" cy="' + g.y + '" r="' + g.r + '"/>';
    return '<g class="hotspot" data-id="' + i + '" role="button" tabindex="0"' +
      ' aria-label="Difference ' + (i + 1) + ': ' + diff.label + '"' +
      ' title="Difference ' + (i + 1) + ': ' + diff.label + '">' + shape + '</g>';
  }

  function markerMarkup(variant, diff, i) {
    var g = geomFor(variant, diff);
    var ring;
    var bx;
    var by;
    if (g.w) {
      bx = g.x + g.w + 7;
      by = g.y + g.h / 2;
      ring = '<rect x="' + (g.x + 1) + '" y="' + (g.y + 1) + '" width="' + (g.w - 2) + '" height="' + (g.h - 2) + '" rx="6" fill="rgba(16,185,129,0.18)" stroke="#10b981" stroke-width="3"/>';
    } else {
      bx = g.x + g.r * 0.75;
      by = g.y + g.r * 0.75;
      ring = '<circle cx="' + g.x + '" cy="' + g.y + '" r="' + g.r + '" fill="rgba(16,185,129,0.18)" stroke="#10b981" stroke-width="3"/>';
    }
    return '<g class="marker js-marker" data-id="' + i + '">' +
      ring +
      '<circle cx="' + bx + '" cy="' + by + '" r="8.5" fill="#10b981"/>' +
      '<text x="' + bx + '" y="' + by + '" text-anchor="middle" dominant-baseline="central" fill="#ffffff" font-size="12" font-weight="700">' + (i + 1) + '</text>' +
    '</g>';
  }

  function sceneBase(roundId, variant) {
    return '<defs>' +
      grad('skyGrad-' + roundId + '-' + variant, '#aee3ff', '#eef9ff') +
      grad('grassGrad-' + roundId + '-' + variant, '#8fd36e', '#73bd58') +
    '</defs>';
  }

  function sceneBody(round, variant) {
    var id = round.id;
    var isA = variant === 'A';
    var sky = 'url(#skyGrad-' + id + '-' + variant + ')';
    var grass = 'url(#grassGrad-' + id + '-' + variant + ')';

    var body = '';

    if (id === 'beach') {
      var ballColor = isA ? '#e63946' : '#2563eb';
      var sail = isA
        ? '<path d="M150 100 L168 117 L150 118 Z" fill="#f8fafc" stroke="#64748b" stroke-width="1.5"/>'
        : '<path d="M150 100 L132 117 L150 118 Z" fill="#fde68a" stroke="#64748b" stroke-width="1.5"/>';

      body =
        '<defs>' +
          grad('skyGrad-' + id + '-' + variant, '#a7d9f2', '#eaf8ff') +
          grad('seaGrad-' + id + '-' + variant, '#2f9ad0', '#4db8e3') +
        '</defs>' +
        '<rect x="0" y="0" width="300" height="112" fill="' + sky + '"/>' +
        '<g>' + sunMarkup(258, 36) + '<circle cx="258" cy="36" r="12" fill="#ffd23b"/></g>' +
        cloudMarkup(60, 32, 1) +
        (isA ? '<g transform="translate(72,54)"><path d="M-13 2 Q-7 -6 0 2 Q7 -6 13 2" fill="none" stroke="#475569" stroke-width="2.5" stroke-linecap="round"/></g>' : '') +
        '<rect x="0" y="112" width="300" height="44" fill="url(#seaGrad-' + id + '-' + variant + ')"/>' +
        '<path d="M0 122 H300 M0 140 H300" stroke="#ffffff" stroke-width="2" opacity="0.35" stroke-dasharray="10 8"/>' +
        '<g>' +
          '<line x1="150" y1="100" x2="150" y2="120" stroke="#6b4f2a" stroke-width="2"/>' +
          sail +
          '<path d="M150 98 L156 101 L150 104 Z" fill="#e63946"/>' +
          '<path d="M138 121 L162 121 L155 128 L145 128 Z" fill="#8b5a2b"/>' +
        '</g>' +
        '<rect x="0" y="156" width="300" height="44" fill="#f4e3bd"/>' +
        '<line x1="0" y1="156" x2="300" y2="156" stroke="#e7d3a8" stroke-width="2"/>' +
        (!isA ? starfishMarkup(98, 178) : '') +
        '<g>' +
          '<circle cx="48" cy="165" r="11" fill="#ffffff"/>' +
          '<path d="M37 165 A11 11 0 0 1 59 165 Z" fill="' + ballColor + '"/>' +
          '<circle cx="48" cy="165" r="3.4" fill="#ffffff"/>' +
          '<circle cx="44" cy="160" r="1.8" fill="#ffffff" opacity="0.9"/>' +
        '</g>' +
        '<path d="M266 158 Q264 178 268 199" fill="none" stroke="#c9883f" stroke-width="7" stroke-linecap="round"/>' +
        '<path d="M266 160 Q244 142 230 148 Q246 154 266 164 Z" fill="#2f9e44"/>' +
        '<path d="M266 160 Q288 142 302 148 Q288 154 266 164 Z" fill="#2f9e44"/>' +
        '<path d="M266 155 Q254 128 250 112 Q260 128 268 156 Z" fill="#37b24d"/>' +
        '<path d="M266 155 Q278 126 284 110 Q276 128 267 157 Z" fill="#37b24d"/>' +
        '<path d="M268 164 Q258 176 252 190 Q264 176 270 162 Z" fill="#2f9e44"/>' +
        '<circle cx="266" cy="167" r="4" fill="#8b5a2b"/>';
    }

    else if (id === 'street') {
      var roofColor = isA ? '#d25434' : '#3b82f6';

      body =
        sceneBase(id, variant) +
        '<rect x="0" y="0" width="300" height="148" fill="' + sky + '"/>' +
        '<g>' + sunMarkup(255, 40) + '<circle cx="255" cy="40" r="10" fill="#ffd23b"/></g>' +
        cloudMarkup(70, 32, 1) +
        '<polygon points="0,150 70,104 140,150" fill="#a9d78f"/>' +
        '<polygon points="160,150 240,110 300,150" fill="#96cb7d"/>' +
        '<rect x="0" y="148" width="300" height="52" fill="' + grass + '"/>' +
        '<g>' +
          '<rect x="52" y="118" width="12" height="32" fill="#8b5a2b"/>' +
          '<circle cx="58" cy="100" r="20" fill="#3f8e44"/>' +
          '<circle cx="48" cy="112" r="15" fill="#4e9f4f"/>' +
          '<circle cx="68" cy="112" r="15" fill="#58ad55"/>' +
        '</g>' +
        (isA ? '<g><rect x="100" y="56" width="12" height="24" rx="1" fill="#9c6b3c"/><rect x="97" y="52" width="18" height="5" rx="2" fill="#7a4a28"/></g>' : '') +
        '<polygon points="70,92 135,52 200,92" fill="' + roofColor + '"/>' +
        '<rect x="80" y="92" width="110" height="56" fill="#f3e3c4"/>' +
        '<rect x="128" y="116" width="22" height="32" rx="2" fill="#7a4a28"/>' +
        '<circle cx="145" cy="133" r="1.6" fill="#ffd23b"/>' +
        '<g>' +
          '<rect x="94" y="100" width="16" height="16" rx="1" fill="#bcdcf2" stroke="#64748b"/>' +
          '<path d="M102 100 v16 M94 108 h16" stroke="#64748b" stroke-width="1.5"/>' +
          '<rect x="162" y="100" width="16" height="16" rx="1" fill="#bcdcf2" stroke="#64748b"/>' +
          (isA ? '<path d="M170 100 v16 M162 108 h16" stroke="#64748b" stroke-width="1.5"/>' : '') +
        '</g>' +
        '<rect x="128" y="146" width="22" height="8" rx="2" fill="#c7b396"/>' +
        (!isA ? catMarkup(150, 143) : '') +
        '<g>' + dogMarkup(isA ? 56 : 230, isA ? 163 : 165) + '</g>' +
        '<g>' +
          '<circle cx="216" cy="152" r="9" fill="#2e7d32"/>' +
          '<circle cx="228" cy="147" r="12" fill="#388e3c"/>' +
          '<circle cx="239" cy="153" r="9" fill="#2e7d32"/>' +
        '</g>';
    }

    else if (id === 'space') {
      var stars = [[30,30],[55,80],[90,40],[122,24],[150,60],[182,34],[210,75],[242,18],[270,64],[20,112],[58,132],[140,92],[200,120],[84,150],[256,140],[42,158]];
      var starBase = '';
      for (var si = 0; si < stars.length; si++) {
        starBase += '<circle cx="' + stars[si][0] + '" cy="' + stars[si][1] + '" r="' + (stars[si][0] % 3 === 0 ? 1.6 : 1) + '" fill="#fde68a" opacity="' + (stars[si][0] % 2 === 0 ? '0.9' : '0.55') + '"/>';
      }
      var moon = isA
        ? '<circle cx="240" cy="44" r="20" fill="#fef3c7"/><circle cx="233" cy="40" r="20" fill="#25225e"/>'
        : '<circle cx="240" cy="44" r="20" fill="#fef3c7"/><circle cx="233" cy="39" r="3" fill="#fde68a" opacity="0.8"/><circle cx="247" cy="49" r="2.4" fill="#fde68a" opacity="0.8"/>';
      var bigStar = isA ? starPts(118, 66, 5, 2.2) : starPts(118, 66, 7.6, 3.3);
      var rocketPos = isA ? 'translate(60,150)' : 'translate(214,150)';

      body =
        '<defs>' + grad('skyGrad-' + id + '-' + variant, '#1e1b4b', '#312e81') + '</defs>' +
        '<rect x="0" y="0" width="300" height="200" fill="' + sky + '"/>' +
        starBase +
        moon +
        '<polygon points="' + bigStar + '" fill="#fde68a"/>' +
        (!isA
          ? '<line x1="80" y1="118" x2="94" y2="104" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>' +
            '<circle cx="94" cy="104" r="2.4" fill="#ffffff"/>' +
            '<line x1="90" y1="108" x2="86" y2="112" stroke="#e2e8f0" stroke-width="1" stroke-linecap="round"/>'
          : '') +
        (isA
          ? '<circle cx="190" cy="130" r="13" fill="#f59e0b"/><circle cx="186" cy="125" r="3" fill="#d97706" opacity="0.8"/>' +
            '<ellipse cx="190" cy="130" rx="23" ry="6.5" fill="none" stroke="#fde68a" stroke-width="2.5" transform="rotate(-18 190 130)"/>'
          : '') +
        '<g transform="' + rocketPos + '">' +
          '<path d="M0 -8 L5 0 L-5 0 Z" fill="#ef4444"/>' +
          '<rect x="-5" y="0" width="10" height="9" rx="2" fill="#e2e8f0"/>' +
          '<circle cx="0" cy="3" r="2.6" fill="#3b82f6"/>' +
          '<path d="M-5 5 L-9 11 L-5 9 Z" fill="#ef4444"/>' +
          '<path d="M5 5 L9 11 L5 9 Z" fill="#ef4444"/>' +
          '<path d="M-3 9 L0 15 L3 9 Z" fill="#f97316"/>' +
        '</g>' +
        '<rect x="0" y="176" width="300" height="24" fill="#242052"/>' +
        '<polygon points="0,178 55,132 110,178" fill="#3d2a78"/>' +
        '<polygon points="120,178 175,126 230,178" fill="#2f1f62"/>' +
        '<polygon points="210,178 270,136 300,178" fill="#3d2a78"/>';
    }

    else if (id === 'garden') {
      var flowerColor = isA ? '#e76f51' : '#8e44ad';
      var petalR = isA ? 4.5 : 6;
      var butterflyPos = isA ? 'translate(60,82)' : 'translate(236,92)';

      body =
        sceneBase(id, variant) +
        '<rect x="0" y="0" width="300" height="160" fill="' + sky + '"/>' +
        '<g>' + sunMarkup(48, 36) + '<circle cx="48" cy="36" r="11" fill="#ffd23b"/></g>' +
        cloudMarkup(226, 42, 0.9) +
        '<rect x="0" y="160" width="300" height="40" fill="' + grass + '"/>' +
        '<g transform="' + butterflyPos + '">' +
          '<ellipse cx="-8" cy="-2" rx="8" ry="6" fill="#fbbf24" opacity="0.95"/>' +
          '<ellipse cx="8" cy="-2" rx="8" ry="6" fill="#fbbf24" opacity="0.95"/>' +
          '<ellipse cx="-6" cy="5" rx="5" ry="4" fill="#f59e0b"/>' +
          '<ellipse cx="6" cy="5" rx="5" ry="4" fill="#f59e0b"/>' +
          '<rect x="-2" y="-8" width="4" height="12" rx="2" fill="#475569"/>' +
        '</g>' +
        (!isA ? birdMarkup(142, 66) : '') +
        '<g>' +
          '<ellipse cx="-1" cy="0" rx="4" ry="3" fill="#2b3440"/>' +
          '<ellipse cx="-2" cy="-2" rx="3.4" ry="2.2" fill="#e2e8f0" opacity="0.85"/>' +
          '<ellipse cx="2.6" cy="-2" rx="3.4" ry="2.2" fill="#e2e8f0" opacity="0.85"/>' +
        '</g>' +
        '<g>' +
          '<line x1="70" y1="150" x2="70" y2="130" stroke="#2e7d32" stroke-width="2"/>' +
          '<path d="M70 142 Q63 140 61 134" stroke="#2e7d32" fill="none" stroke-width="2"/>' +
          petalsMarkup(70, 126, petalR, '#f472b6') +
        '</g>' +
        '<g>' +
          '<line x1="150" y1="150" x2="150" y2="128" stroke="#2e7d32" stroke-width="2"/>' +
          '<path d="M150 140 Q157 138 160 133" stroke="#2e7d32" fill="none" stroke-width="2"/>' +
          petalsMarkup(150, 116, 5, flowerColor) +
        '</g>' +
        '<g>' +
          '<line x1="230" y1="148" x2="230" y2="126" stroke="#2e7d32" stroke-width="2"/>' +
          (isA ? '<ellipse cx="221" cy="133" rx="4.2" ry="2.2" fill="#2e7d32" transform="rotate(-35 221 133)"/>' : '') +
          petalsMarkup(230, 122, 5, '#2a9d8f') +
        '</g>' +
        '<g>' +
          '<rect x="246" y="122" width="14" height="14" rx="2" fill="#a3b18a"/>' +
          '<polygon points="253,112 260,122 246,122" fill="#7c4a23"/>' +
          '<circle cx="253" cy="129" r="2" fill="#3f3a2a"/>' +
        '</g>' +
        '<g>' +
          '<circle cx="278" cy="168" r="9" fill="#2e7d32"/>' +
          '<circle cx="288" cy="164" r="11" fill="#388e3c"/>' +
        '</g>';
    }

    else if (id === 'park') {
      var swingColor = isA ? '#e63946' : '#16a34a';
      var kitePos = isA ? 'translate(206,84)' : 'translate(252,56)';
      var fountain = isA
        ? '<ellipse cx="150" cy="152" rx="20" ry="5" fill="#7dbce6"/>' +
          '<path d="M132 148 A18 18 0 0 1 168 148 Z" fill="#93c5fd"/>' +
          '<line x1="150" y1="148" x2="150" y2="138" stroke="#60a5fa" stroke-width="2"/>' +
          '<circle cx="150" cy="137" r="2.6" fill="#bfdbfe"/>'
        : '<rect x="132" y="148" width="36" height="7" rx="1.5" fill="#93c5fd"/>' +
          '<rect x="142" y="141" width="16" height="8" rx="1.5" fill="#7fb3e8"/>' +
          '<line x1="150" y1="141" x2="150" y2="133" stroke="#60a5fa" stroke-width="2"/>' +
          '<circle cx="150" cy="132" r="2.6" fill="#bfdbfe"/>';

      body =
        sceneBase(id, variant) +
        '<rect x="0" y="0" width="300" height="150" fill="' + sky + '"/>' +
        '<g>' + sunMarkup(258, 40) + '<circle cx="258" cy="40" r="10" fill="#ffd23b"/></g>' +
        cloudMarkup(150, 32, 0.85) +
        (isA ? cloudMarkup(60, 46, 0.8) : '') +
        '<rect x="0" y="150" width="300" height="50" fill="' + grass + '"/>' +
        '<g>' +
          '<line x1="72" y1="60" x2="58" y2="152" stroke="#8b7355" stroke-width="5"/>' +
          '<line x1="72" y1="60" x2="86" y2="152" stroke="#8b7355" stroke-width="5"/>' +
          '<line x1="72" y1="60" x2="118" y2="60" stroke="#8b7355" stroke-width="5"/>' +
          '<line x1="118" y1="60" x2="104" y2="152" stroke="#8b7355" stroke-width="5"/>' +
          '<line x1="118" y1="60" x2="132" y2="152" stroke="#8b7355" stroke-width="5"/>' +
          '<line x1="94" y1="60" x2="90" y2="112" stroke="#64748b" stroke-width="1.5"/>' +
          '<line x1="112" y1="60" x2="110" y2="112" stroke="#64748b" stroke-width="1.5"/>' +
          '<rect x="84" y="112" width="32" height="5" rx="2.5" fill="' + swingColor + '"/>' +
        '</g>' +
        '<g transform="' + kitePos + '">' +
          '<polygon points="0,-14 10,0 0,14 -10,0" fill="#f59e0b"/>' +
          '<path d="M-10 0 L10 0 M0 -14 L0 14" stroke="#ffffff" stroke-width="1.2" opacity="0.85"/>' +
          '<path d="M0 13 q5 7 0 11 M0 24 q-5 6 0 11" stroke="#f59e0b" fill="none" stroke-width="1.5"/>' +
        '</g>' +
        fountain +
        (!isA
          ? '<rect x="182" y="150" width="30" height="4" rx="2" fill="#a16207"/>' +
            '<rect x="184" y="156" width="4" height="9" fill="#8b5a2b"/>' +
            '<rect x="206" y="156" width="4" height="9" fill="#8b5a2b"/>' +
            '<rect x="180" y="157" width="34" height="3" rx="1.5" fill="#8b5a2b"/>' +
            '<rect x="180" y="146" width="4" height="13" fill="#7a4a28"/>' +
            '<rect x="210" y="146" width="4" height="13" fill="#7a4a28"/>'
          : '') +
        '<g>' +
          '<rect x="252" y="150" width="8" height="26" fill="#7c4a23"/>' +
          '<circle cx="252" cy="130" r="13" fill="#3f8e44"/>' +
          '<circle cx="242" cy="140" r="10" fill="#4e9f4f"/>' +
          '<circle cx="263" cy="139" r="10" fill="#58ad55"/>' +
        '</g>';
    }

    else if (id === 'market') {
      var appleColor = isA ? '#e63946' : '#43a047';
      var plantPos = isA ? 'translate(100,168)' : 'translate(252,170)';
      var crateA = isA
        ? '<rect x="50" y="168" width="26" height="22" rx="1.5" fill="#b08968" stroke="#8d6b4e"/>' +
          '<line x1="50" y1="179" x2="76" y2="179" stroke="#8d6b4e" stroke-width="1.5"/>'
        : '<rect x="56" y="172" width="16" height="14" rx="1.5" fill="#b08968" stroke="#8d6b4e"/>' +
          '<line x1="56" y1="179" x2="72" y2="179" stroke="#8d6b4e" stroke-width="1.5"/>';

      var stripes = '';
      for (var st = 0; st < 4; st++) {
        var sx = 40 + st * 64;
        var show = !(!isA && st === 2);
        if (show) {
          stripes += '<rect x="' + sx + '" y="46" width="32" height="26" fill="#e63946"/>' +
            '<path d="M' + sx + ' 72 a16 8 0 0 0 32 0 z" fill="#e63946"/>';
        }
      }

      body =
        '<defs>' + grad('skyGrad-' + id + '-' + variant, '#f6ead4', '#f6ead4') + '</defs>' +
        '<rect x="0" y="0" width="300" height="300" fill="#f6ead4"/>' +
        '<rect x="30" y="42" width="240" height="6" fill="#d98f6f"/>' +
        '<rect x="30" y="46" width="240" height="26" fill="#faf3e4"/>' +
        stripes +
        '<rect x="0" y="72" width="300" height="96" fill="#f6ead4"/>' +
        '<rect x="120" y="118" width="96" height="50" fill="#e0c29a"/>' +
        '<rect x="120" y="112" width="96" height="8" rx="2" fill="#caa678"/>' +
        '<g>' +
          '<ellipse cx="170" cy="115" rx="15" ry="5" fill="#8d6b4e"/>' +
          '<circle cx="163" cy="110" r="4.5" fill="' + appleColor + '"/>' +
          '<circle cx="175" cy="113" r="4.5" fill="' + appleColor + '"/>' +
          '<circle cx="181" cy="108" r="4.5" fill="' + appleColor + '"/>' +
        '</g>' +
        '<rect x="0" y="168" width="300" height="32" fill="#d6b185"/>' +
        crateA +
        '<g transform="' + plantPos + '">' +
          '<path d="M0 -4 Q-5 -18 -8 -23 Q-3 -16 0 -6 M0 -4 Q5 -20 9 -24 Q3 -16 1 -6 M0 -4 Q0 -21 0 -26" stroke="#2e7d32" stroke-width="2" fill="none" stroke-linecap="round"/>' +
          '<ellipse cx="-8" cy="-23" rx="4.5" ry="2.2" fill="#3f8e44" transform="rotate(-30 -8 -23)"/>' +
          '<ellipse cx="9" cy="-24" rx="4.5" ry="2.2" fill="#3f8e44" transform="rotate(25 9 -24)"/>' +
          '<rect x="-8" y="-2" width="16" height="11" rx="2.5" fill="#c0653f"/>' +
        '</g>' +
        (!isA
          ? '<g transform="translate(32,178)">' +
            '<rect x="-8" y="-4" width="16" height="7" rx="3.5" fill="#c98d4b"/>' +
            '<circle cx="-7" cy="-6" r="3.5" fill="#c98d4b"/>' +
            '<ellipse cx="-7" cy="-6" rx="2.6" ry="2.2" fill="#a06b36"/>' +
            '<path d="M-9 -8 l-3 -3 M-9 -8 l-1 -3" stroke="#a06b36" fill="none" stroke-width="1.5" stroke-linecap="round"/>' +
            '<path d="M7 -3 q4 -4 2 -8" stroke="#c98d4b" fill="none" stroke-width="2" stroke-linecap="round"/>' +
            '<rect x="-6" y="3" width="2.6" height="5" rx="1" fill="#a06b36"/>' +
            '<rect x="0" y="3" width="2.6" height="5" rx="1" fill="#a06b36"/>' +
          '</g>'
          : '') +
        '<rect x="40" y="78" width="56" height="20" rx="4" fill="#f8fafc" stroke="#94a3b8"/>' +
        '<text x="68" y="92" text-anchor="middle" font-size="9" font-weight="700" fill="#475569" font-family="ui-monospace,monospace">FRESH</text>';
    }

    else if (id === 'farm') {
      var doorColor = isA ? '#8b5a2b' : '#2563eb';
      var treeCrown = isA
        ? '<circle cx="32" cy="104" r="18" fill="#4e9f4f"/><circle cx="24" cy="116" r="13" fill="#3f8e44"/><circle cx="42" cy="115" r="13" fill="#58ad55"/>'
        : '<polygon points="32,78 48,126 16,126" fill="#3f8e44"/><polygon points="32,100 54,140 10,140" fill="#2f6e36"/>';

      body =
        sceneBase(id, variant) +
        '<rect x="0" y="0" width="300" height="150" fill="' + sky + '"/>' +
        '<g>' + sunMarkup(255, 40) + '<circle cx="255" cy="40" r="10" fill="#ffd23b"/></g>' +
        cloudMarkup(60, 34, 0.9) +
        cloudMarkup(205, 50, 0.75) +
        '<rect x="0" y="150" width="300" height="50" fill="' + grass + '"/>' +
        '<path d="M0 156 H300 M0 172 H300 M0 188 H300" stroke="#ffffff" stroke-width="1" opacity="0.18" stroke-dasharray="14 10"/>' +
        '<g>' +
          '<line x1="32" y1="150" x2="32" y2="124" stroke="#6d4c2f" stroke-width="7"/>' +
          treeCrown +
        '</g>' +
        '<g>' +
          '<rect x="70" y="74" width="92" height="76" fill="#ce4430"/>' +
          '<polygon points="62,74 116,40 170,74" fill="#7a2f26"/>' +
          '<rect x="112" y="86" width="12" height="12" fill="#fdf6e3" stroke="#7a2f26"/>' +
          '<rect x="86" y="104" width="20" height="46" fill="' + doorColor + '"/>' +
          '<circle cx="102" cy="127" r="1.6" fill="#ffd23b"/>' +
        '</g>' +
        '<g stroke="#a16207" fill="none">' +
          '<rect x="8" y="140" width="4" height="20" fill="#a16207" stroke="none"/>' +
          '<rect x="28" y="140" width="4" height="20" fill="#a16207" stroke="none"/>' +
          '<line x1="6" y1="146" x2="34" y2="146" stroke="#a16207" stroke-width="2"/>' +
          '<line x1="6" y1="154" x2="34" y2="154" stroke="#a16207" stroke-width="2"/>' +
          '<rect x="206" y="140" width="4" height="20" fill="#a16207" stroke="none"/>' +
          '<rect x="228" y="140" width="4" height="20" fill="#a16207" stroke="none"/>' +
          '<rect x="250" y="140" width="4" height="20" fill="#a16207" stroke="none"/>' +
          '<rect x="272" y="140" width="4" height="20" fill="#a16207" stroke="none"/>' +
          '<rect x="294" y="140" width="4" height="20" fill="#a16207" stroke="none"/>' +
          '<line x1="204" y1="146" x2="300" y2="146" stroke="#a16207" stroke-width="2"/>' +
          '<line x1="204" y1="154" x2="300" y2="154" stroke="#a16207" stroke-width="2"/>' +
        '</g>' +
        '<g>' +
          '<polygon points="244,150 260,150 258,86 250,86" fill="#a0845c"/>' +
          '<circle cx="252" cy="80" r="3" fill="#475569"/>' +
          (isA
            ? '<g transform="translate(252,80)" stroke="#6b7280" stroke-width="4">' +
              '<line x1="0" y1="-22" x2="0" y2="22"/>' +
              '<line x1="-22" y1="0" x2="22" y2="0"/>' +
            '</g>'
            : '') +
        '</g>' +
        sheepMarkup(isA ? 60 : 206, 166) +
        (!isA
          ? '<g transform="translate(150,170)">' +
            '<rect x="-15" y="-3" width="26" height="13" rx="3" fill="#db4c33"/>' +
            '<rect x="5" y="-7" width="8" height="5" rx="2" fill="#26313c"/>' +
            '<line x1="10" y1="-3" x2="10" y2="-10" stroke="#64748b" stroke-width="2"/>' +
            '<circle cx="-5" cy="8" r="7" fill="#1f2937"/>' +
            '<circle cx="-5" cy="8" r="3" fill="#9ca3af"/>' +
            '<circle cx="7" cy="7" r="4.5" fill="#1f2937"/>' +
            '<circle cx="7" cy="7" r="2" fill="#9ca3af"/>' +
          '</g>'
          : '');
    }

    else if (id === 'camp') {
      var tentSide = isA
        ? '<polygon points="58,176 130,176 94,84" fill="#e76f51"/><polygon points="84,176 104,176 94,132" fill="#2b2d42"/>'
        : '<polygon points="70,176 118,176 94,110" fill="#e76f51"/><polygon points="86,176 102,176 94,142" fill="#2b2d42"/>';
      var backPos = isA ? 'translate(120,170)' : 'translate(244,172)';

      body =
        '<defs>' + grad('skyGrad-' + id + '-' + variant, '#3d3a7c', '#d98b78') + '</defs>' +
        '<rect x="0" y="0" width="300" height="168" fill="' + sky + '"/>' +
        '<circle cx="52" cy="42" r="11" fill="#fde68a"/>' +
        '<circle cx="49" cy="39" r="2.5" fill="#f5c842" opacity="0.8"/>' +
        '<g fill="#fde68a" opacity="0.7">' +
          '<circle cx="90" cy="30" r="1.4"/><circle cx="150" cy="50" r="1.2"/><circle cx="210" cy="34" r="1.6"/>' +
          '<circle cx="270" cy="58" r="1.2"/><circle cx="120" cy="78" r="1.2"/><circle cx="190" cy="80" r="1.4"/>' +
        '</g>' +
        '<polygon points="0,176 80,140 180,176" fill="#3f6950"/>' +
        '<polygon points="160,176 250,150 300,176" fill="#35583e"/>' +
        '<rect x="0" y="176" width="300" height="24" fill="#2c5530"/>' +
        tentSide +
        '<g>' +
          '<line x1="177" y1="184" x2="190" y2="178" stroke="#6b4226" stroke-width="6" stroke-linecap="round"/>' +
          '<line x1="193" y1="184" x2="182" y2="179" stroke="#6b4226" stroke-width="5" stroke-linecap="round"/>' +
          '<path d="M185 176 Q179 164 183 156 Q186 163 188 154 Q191 164 185 176 Z" fill="#f59e0b"/>' +
          '<path d="M185 172 Q182 166 184 161 Q186 166 185 172 Z" fill="#fbbf24"/>' +
        '</g>' +
        (isA
          ? '<path d="M186 142 q-5 -10 2 -18 q6 -8 -2 -16" stroke="#cbd5e1" fill="none" stroke-width="3" stroke-linecap="round" opacity="0.7"/>'
          : '') +
        '<g>' +
          '<rect x="246" y="112" width="10" height="58" fill="#5d4037"/>' +
          '<line x1="238" y1="124" x2="276" y2="114" stroke="#5d4037" stroke-width="5" stroke-linecap="round"/>' +
          '<circle cx="252" cy="90" r="20" fill="#2f6e36"/>' +
          '<circle cx="240" cy="101" r="13" fill="#3f8e44"/>' +
          '<circle cx="264" cy="100" r="12" fill="#275b2d"/>' +
        '</g>' +
        owlMarkup(250, 118, isA) +
        (!isA
          ? '<g transform="translate(266,106)">' +
            '<line x1="0" y1="8" x2="0" y2="-2" stroke="#64748b" stroke-width="1.5"/>' +
            '<rect x="-6" y="-4" width="12" height="15" rx="2" fill="#f59e0b"/>' +
            '<rect x="-3" y="-1" width="6" height="9" fill="#fff7cc"/>' +
            '<rect x="-6" y="-7" width="12" height="4" rx="1.5" fill="#475569"/>' +
          '</g>'
          : '') +
        '<g transform="' + backPos + '">' +
          '<rect x="-10" y="-7" width="20" height="14" rx="4" fill="#7c5a3b"/>' +
          '<rect x="-4" y="-10" width="8" height="5" rx="2" fill="#9c7a5b"/>' +
          '<rect x="-10" y="1" width="20" height="6" rx="2" fill="#6b4a2f"/>' +
          '<path d="M-10 -7 q2 -7 20 0" stroke="#5d4037" fill="none" stroke-width="3" stroke-linecap="round"/>' +
        '</g>';
    }

    return body;
  }

  function buildScene(variant) {
    var hotspots = '';
    for (var i = 0; i < round.differences.length; i++) {
      hotspots += hotspotMarkup(variant, round.differences[i], i);
    }
    return '<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' +
      round.name + ' - picture ' + (variant === 'A' ? '1' : '2') + '">' +
      sceneBody(round, variant) +
      hotspots +
      '<g class="js-markers"></g>' +
    '</svg>';
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
    els.progress.style.width = (found.size / round.differences.length) * 100 + '%';
  }

  function applyRoundMeta() {
    els.total.textContent = String(round.differences.length);
    els.totalHint.textContent = String(round.differences.length);
    els.sceneBadge.textContent = (current + 1) + ' / ' + ROUNDS.length;
    els.sceneName.textContent = round.name;
  }

  function addMarker(panel, variant, id) {
    var layer = panel.querySelector('.js-markers');
    if (!layer) return;
    layer.insertAdjacentHTML('beforeend', markerMarkup(variant, round.differences[id], id));
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

    var n = round.differences.length;
    els.stats.textContent = mistakes === 0
      ? 'You found all ' + n + ' differences without any mistakes!'
      : 'You found all ' + n + ' differences with ' + mistakes + ' mistake' + (mistakes === 1 ? '' : 's') + '.';

    els.playAgain.textContent = current < ROUNDS.length - 1 ? 'Next Scene' : 'Play Again';
    els.message.classList.remove('hidden');
    replay(els.message, 'completion-appear');
  }

  function markFound(id) {
    found.add(id);
    addMarker(panelA, 'A', id);
    addMarker(panelB, 'B', id);
    updateUI();
    if (found.size === round.differences.length) completeGame();
  }

  function handleHotspot(hotspot) {
    if (done) return;
    var id = Number(hotspot.getAttribute('data-id'));
    if (!isFinite(id) || id < 0 || id >= round.differences.length) return;
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

  function resetGame() {
    clearTimeout(flashTimers.A);
    clearTimeout(flashTimers.B);
    done = false;
    mistakes = 0;
    found = new Set();
    round = ROUNDS[current];
    applyRoundMeta();
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
        intro: 'Every scene has several spots hiding in plain sight. First, choose how challenging the targets should be, then press Start when you are ready.',
        descriptions: {
          easy: 'Larger targets and a relaxed pace',
          normal: 'Balanced spots and a comfortable challenge',
          hard: 'Smaller targets to sharpen your observation'
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
    radiusScale = cfg.radiusScale;
    current = 0;
    els.badge.textContent = cfg.label;

    if (selector) selector.hide();
    gameScreen.classList.remove('hidden');

    resetGame();
  }

  var selector = null;

  els.restart.addEventListener('click', resetGame);
  els.playAgain.addEventListener('click', function () {
    current = current < ROUNDS.length - 1 ? current + 1 : 0;
    resetGame();
  });
  els.changeDifficulty.addEventListener('click', showDifficultyScreen);
  els.changeResult.addEventListener('click', showDifficultyScreen);
  panelA.addEventListener('click', onPanelClick);
  panelB.addEventListener('click', onPanelClick);
  panelA.addEventListener('keydown', onPanelKeydown);
  panelB.addEventListener('keydown', onPanelKeydown);

  showDifficultyScreen();
})();