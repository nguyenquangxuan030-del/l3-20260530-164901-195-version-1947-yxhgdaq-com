(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-site-nav]');

    if (menuButton && nav) {
      menuButton.addEventListener('click', function () {
        nav.classList.toggle('is-open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      showSlide(0);
      window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    var searchInput = document.querySelector('[data-search-input]');
    var sortSelect = document.querySelector('[data-sort-select]');
    var grid = document.querySelector('[data-card-grid]');
    var noResults = document.querySelector('[data-no-results]');

    function applyFilters() {
      if (!grid) {
        return;
      }

      var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-category'),
          card.getAttribute('data-genre')
        ].join(' ').toLowerCase();

        var isVisible = !query || haystack.indexOf(query) !== -1;
        card.style.display = isVisible ? '' : 'none';
        if (isVisible) {
          visibleCount += 1;
        }
      });

      if (noResults) {
        noResults.style.display = visibleCount ? 'none' : 'block';
      }
    }

    function applySort() {
      if (!grid || !sortSelect) {
        return;
      }

      var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
      var mode = sortSelect.value;

      cards.sort(function (a, b) {
        if (mode === 'score-desc') {
          return Number(b.getAttribute('data-score')) - Number(a.getAttribute('data-score'));
        }

        if (mode === 'title-asc') {
          return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-Hans-CN');
        }

        return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
      });

      cards.forEach(function (card) {
        grid.appendChild(card);
      });

      applyFilters();
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', applySort);
      applySort();
    } else {
      applyFilters();
    }
  });
})();
