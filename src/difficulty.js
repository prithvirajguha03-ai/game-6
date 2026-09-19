(function () {
  'use strict';

  var LEVELS = [
    {
      id: 'easy',
      acronym: 'EASY',
      label: 'Easy',
      description: 'A relaxed, gentle challenge'
    },
    {
      id: 'normal',
      acronym: 'NORMAL',
      label: 'Normal',
      description: 'Balanced and comfortable'
    },
    {
      id: 'hard',
      acronym: 'HARD',
      label: 'Hard',
      description: 'A more challenging activity'
    }
  ];

  var DEFAULT_DIFFICULTY = 'normal';
  var RADIO_NAME = 'difficulty-choice';

  function normalize(value) {
    for (var i = 0; i < LEVELS.length; i++) {
      if (LEVELS[i].id === value) return value;
    }
    return DEFAULT_DIFFICULTY;
  }

  function level(id) {
    for (var i = 0; i < LEVELS.length; i++) {
      if (LEVELS[i].id === id) return LEVELS[i];
    }
    return null;
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function cardMarkup(lvl, description) {
    return '' +
      '<label class="group relative flex w-full cursor-pointer select-none">' +
        '<input type="radio" name="' + RADIO_NAME + '" value="' + lvl.id + '" class="peer sr-only">' +
        '<span class="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-emerald-600 px-3 py-1 text-sm font-bold text-white opacity-0 transition-opacity duration-150 peer-checked:opacity-100">Selected</span>' +
        '<span class="flex w-full items-center gap-4 rounded-2xl border-2 border-slate-200 bg-white p-4 pr-28 text-left transition-colors duration-150 peer-checked:border-emerald-600 peer-checked:bg-emerald-50 peer-checked:shadow-md peer-focus-visible:border-emerald-600 peer-focus-visible:ring-4 peer-focus-visible:ring-emerald-300 hover:border-slate-300">' +
          '<span class="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-slate-400 text-xs font-extrabold tracking-wide text-white transition-colors duration-150 group-hover:bg-slate-500">' + lvl.acronym + '</span>' +
          '<span>' +
            '<span class="block text-xl font-bold text-slate-900">' + lvl.label + '</span>' +
            '<span class="block text-sm sm:text-base text-slate-600">' + escapeHtml(description) + '</span>' +
          '</span>' +
        '</span>' +
      '</label>';
  }

  function buildScreen(container, options) {
    options = options || {};
    var descriptions = options.descriptions || {};
    var title = options.title || 'Memory Activity';
    var kicker = options.kicker || 'Daily brain activity';
    var subtitle = options.subtitle || 'First, choose how challenging today\u2019s activity should be, then press Start when you are ready.';

    var cards = '';
    for (var i = 0; i < LEVELS.length; i++) {
      cards += cardMarkup(LEVELS[i], descriptions[LEVELS[i].id] || LEVELS[i].description);
    }

    container.innerHTML = '' +
      '<section id="difficultyScreen" class="flex w-full flex-col items-center gap-8 py-4 sm:py-6">' +
        '<header class="text-center">' +
          '<p class="text-xs font-bold uppercase tracking-widest text-emerald-600 sm:text-sm">' + escapeHtml(kicker) + '</p>' +
          '<h1 id="difficulty-title" class="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">' + escapeHtml(title) + '</h1>' +
          '<p class="mx-auto mt-3 max-w-xl text-base text-slate-600 sm:text-lg">' + escapeHtml(subtitle) + '</p>' +
        '</header>' +

        '<fieldset id="difficultyFieldset" class="m-0 w-full max-w-xl p-0" role="radiogroup" aria-labelledby="difficulty-heading">' +
          '<legend id="difficulty-heading" class="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Choose your difficulty</legend>' +
          '<div class="flex flex-col gap-4">' + cards + '</div>' +
        '</fieldset>' +

        '<div class="flex flex-wrap items-center justify-center gap-4">' +
          '<button type="button" id="difficulty-back" class="rounded-full bg-white px-8 py-4 text-lg font-semibold text-slate-700 ring-1 ring-slate-300 transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 active:scale-95">Back</button>' +
          '<button type="button" id="difficulty-start" class="rounded-full bg-emerald-600 px-12 py-4 text-lg font-bold text-white transition hover:bg-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:active:scale-100" disabled>Start Game</button>' +
        '</div>' +
      '</section>';

    var fieldset = container.querySelector('#difficultyFieldset');
    var startBtn = container.querySelector('#difficulty-start');
    var backBtn = container.querySelector('#difficulty-back');
    var selected = null;

    function readSelected() {
      var checked = fieldset.querySelector('input[type="radio"]:checked');
      return checked ? checked.value : null;
    }

    fieldset.addEventListener('change', function () {
      selected = readSelected();
      startBtn.disabled = !selected;
    });

    startBtn.addEventListener('click', function () {
      if (!selected) return;
      options.onStart && options.onStart(normalize(selected));
    });

    backBtn.addEventListener('click', function () {
      options.onBack && options.onBack();
    });

    return {
      setValue: function (value) {
        var id = normalize(value);
        var radio = fieldset.querySelector('input[value="' + id + '"]');
        if (radio) {
          radio.checked = true;
          selected = id;
          startBtn.disabled = false;
        }
      },
      getValue: function () {
        return normalize(selected || DEFAULT_DIFFICULTY);
      },
      reset: function () {
        fieldset.querySelectorAll('input[type="radio"]').forEach(function (radio) {
          radio.checked = false;
        });
        selected = null;
        startBtn.disabled = true;
      }
    };
  }

  window.GameDifficulty = {
    LEVELS: LEVELS,
    DEFAULT_DIFFICULTY: DEFAULT_DIFFICULTY,
    normalize: normalize,
    level: level,
    buildScreen: buildScreen
  };
})();