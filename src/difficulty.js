(function () {
  'use strict';

  var LEVELS = [
    { id: 'easy', label: 'Easy', tagline: 'Relaxed challenge' },
    { id: 'normal', label: 'Normal', tagline: 'Balanced challenge' },
    { id: 'hard', label: 'Hard', tagline: 'More challenging' }
  ];

  var DEFAULT_DIFFICULTY = 'normal';

  function normalize(value) {
    var v = String(value === undefined || value === null ? '' : value).toLowerCase();
    for (var i = 0; i < LEVELS.length; i++) {
      if (LEVELS[i].id === v) return v;
    }
    return DEFAULT_DIFFICULTY;
  }

  function level(id) {
    var n = normalize(id);
    for (var i = 0; i < LEVELS.length; i++) {
      if (LEVELS[i].id === n) return LEVELS[i];
    }
    return null;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  var CHECK_SVG =
    '<svg class="difficulty-option-check" viewBox="0 0 20 20" fill="none" aria-hidden="true">' +
    '<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M4 10.5l4 4 8-8"></path>' +
    '</svg>';

  function buildScreen(container, options) {
    options = options || {};
    var descriptions = options.descriptions || {};
    var levels = [];
    for (var i = 0; i < LEVELS.length; i++) {
      levels.push({
        id: LEVELS[i].id,
        label: LEVELS[i].label,
        tagline: descriptions[LEVELS[i].id] || LEVELS[i].tagline
      });
    }

    var title = options.title || 'Choose Your Difficulty';
    var intro = options.intro || 'Select how challenging you want today\u2019s activity to be. You can change it at any time.';
    var eyebrow = options.eyebrow || '';
    var startLabel = options.startLabel || 'Start Game';
    var backLabel = options.backLabel || 'Back';
    var onStart = typeof options.onStart === 'function' ? options.onStart : null;
    var onBack = typeof options.onBack === 'function' ? options.onBack : null;
    var initial = normalize(options.initial || DEFAULT_DIFFICULTY);

    var uid = 'gd-' + Math.random().toString(36).slice(2, 9);
    var titleId = uid + '-title';

    var optionsHtml = '';
    levels.forEach(function (lv) {
      optionsHtml +=
        '<button type="button" role="radio" aria-checked="false" class="difficulty-option" data-difficulty="' +
          escapeHtml(lv.id) + '" tabindex="-1">' +
          '<span class="difficulty-option-indicator" aria-hidden="true">' + CHECK_SVG + '</span>' +
          '<span class="difficulty-option-text">' +
            '<span class="difficulty-option-label">' + escapeHtml(lv.label) + '</span>' +
            '<span class="difficulty-option-tagline">' + escapeHtml(lv.tagline) + '</span>' +
          '</span>' +
        '</button>';
    });

    var html =
      '<div class="difficulty-screen is-hidden" role="dialog" aria-modal="true" aria-labelledby="' + titleId + '">' +
        '<div class="difficulty-panel">' +
          (eyebrow ? '<p class="difficulty-eyebrow">' + escapeHtml(eyebrow) + '</p>' : '') +
          '<h2 class="difficulty-title" id="' + titleId + '">' + escapeHtml(title) + '</h2>' +
          '<p class="difficulty-intro">' + escapeHtml(intro) + '</p>' +
          '<div class="difficulty-options" role="radiogroup" aria-labelledby="' + titleId + '">' +
            optionsHtml +
          '</div>' +
          '<button type="button" class="difficulty-start" disabled>' + escapeHtml(startLabel) + '</button>' +
          '<button type="button" class="difficulty-back">' + escapeHtml(backLabel) + '</button>' +
        '</div>' +
      '</div>';

    container.innerHTML = html;
    var screen = container.firstElementChild;
    var startBtn = screen.querySelector('.difficulty-start');
    var backBtn = screen.querySelector('.difficulty-back');
    var group = screen.querySelector('.difficulty-options');
    var optionEls = Array.prototype.slice.call(screen.querySelectorAll('.difficulty-option'));

    var selectedIndex = -1;

    function select(index, doFocus) {
      index = Math.max(0, Math.min(optionEls.length - 1, index));
      if (index === selectedIndex) {
        if (doFocus && optionEls[index]) optionEls[index].focus();
        return;
      }
      selectedIndex = index;
      optionEls.forEach(function (el, i) {
        var isSelected = i === selectedIndex;
        el.classList.toggle('is-selected', isSelected);
        el.setAttribute('aria-checked', isSelected ? 'true' : 'false');
        el.tabIndex = isSelected ? 0 : -1;
      });
      if (doFocus && optionEls[index]) optionEls[index].focus();
      startBtn.disabled = selectedIndex === -1;
    }

    function focusSelected() {
      if (selectedIndex !== -1 && optionEls[selectedIndex]) optionEls[selectedIndex].focus();
    }

    // Roving tabindex + arrow-key navigation (ARIA radiogroup pattern).
    group.addEventListener('keydown', function (event) {
      var keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
      if (keys.indexOf(event.key) === -1) return;
      event.preventDefault();
      var next = selectedIndex;
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next -= 1;
      else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next += 1;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = optionEls.length - 1;
      select(next, true);
    });

    optionEls.forEach(function (el, i) {
      el.addEventListener('click', function () {
        select(i, true);
      });
    });

    startBtn.addEventListener('click', function () {
      if (startBtn.disabled || !onStart) return;
      onStart(levels[selectedIndex].id);
    });

    backBtn.addEventListener('click', function () {
      if (onBack) onBack();
    });

    // Pre-select the requested level (defaults to "normal") so Start is ready.
    var initialIndex = 0;
    for (var k = 0; k < levels.length; k++) {
      if (levels[k].id === initial) {
        initialIndex = k;
        break;
      }
    }
    select(initialIndex, false);

    return {
      show: function () {
        screen.classList.remove('is-hidden');
        focusSelected();
      },
      hide: function () {
        screen.classList.add('is-hidden');
      },
      setValue: function (id) {
        var target = normalize(id);
        var index = 0;
        for (var j = 0; j < levels.length; j++) {
          if (levels[j].id === target) {
            index = j;
            break;
          }
        }
        select(index, false);
      },
      getValue: function () {
        return selectedIndex === -1 ? DEFAULT_DIFFICULTY : levels[selectedIndex].id;
      },
      reset: function () {
        optionEls.forEach(function (el) {
          el.classList.remove('is-selected');
          el.setAttribute('aria-checked', 'false');
          el.tabIndex = -1;
        });
        selectedIndex = -1;
        startBtn.disabled = true;
      },
      isVisible: function () {
        return !screen.classList.contains('is-hidden');
      },
      destroy: function () {
        if (screen.parentNode) screen.parentNode.removeChild(screen);
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