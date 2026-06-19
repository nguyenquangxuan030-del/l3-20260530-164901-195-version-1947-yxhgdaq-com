(function () {
  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupMobileMenu() {
    var toggle = document.querySelector('.mobile-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      var opened = panel.hasAttribute('hidden');
      if (opened) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
      toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
      var scope = panel.closest('[data-search-page]') || panel.parentElement || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
      var empty = scope.querySelector('[data-empty-state]');
      var input = panel.querySelector('[data-live-search]');
      var region = panel.querySelector('[data-filter-region]');
      var type = panel.querySelector('[data-filter-type]');
      var year = panel.querySelector('[data-filter-year]');
      var category = panel.querySelector('[data-filter-category]');
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q && input) {
        input.value = q;
      }

      function matches(card) {
        var query = normalize(input && input.value);
        var regionValue = normalize(region && region.value);
        var typeValue = normalize(type && type.value);
        var yearValue = normalize(year && year.value);
        var categoryValue = normalize(category && category.value);
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.category
        ].join(' '));
        if (query && haystack.indexOf(query) === -1) {
          return false;
        }
        if (regionValue && normalize(card.dataset.region) !== regionValue) {
          return false;
        }
        if (typeValue && normalize(card.dataset.type) !== typeValue) {
          return false;
        }
        if (yearValue && normalize(card.dataset.year) !== yearValue) {
          return false;
        }
        if (categoryValue && normalize(card.dataset.category) !== categoryValue) {
          return false;
        }
        return true;
      }

      function apply() {
        var visible = 0;
        cards.forEach(function (card) {
          var ok = matches(card);
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [input, region, type, year, category].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
  });
})();
