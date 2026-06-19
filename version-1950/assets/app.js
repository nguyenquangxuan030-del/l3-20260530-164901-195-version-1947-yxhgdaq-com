(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initHeader() {
    var header = $('.site-header');
    var menuButton = $('[data-menu-button]');
    var mobileNav = $('[data-mobile-nav]');

    function updateHeader() {
      if (!header) {
        return;
      }
      header.classList.toggle('scrolled', window.scrollY > 6);
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    if (menuButton && mobileNav) {
      menuButton.addEventListener('click', function () {
        mobileNav.classList.toggle('open');
      });
    }
  }

  function initHero() {
    var hero = $('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    var prev = $('[data-hero-prev]', hero);
    var next = $('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var bars = $all('[data-filter-bar]');
    if (!bars.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    bars.forEach(function (bar) {
      var section = bar.closest('section') || document;
      var grid = $('.filter-grid', section);
      var cards = grid ? $all('[data-card]', grid) : [];
      var empty = $('[data-empty-state]', section);
      var search = $('.js-search-input', bar);
      var selects = $all('[data-filter]', bar);

      if (query && search) {
        search.value = query;
      }

      function apply() {
        var keyword = search ? search.value.trim().toLowerCase() : '';
        var values = {};
        selects.forEach(function (select) {
          values[select.getAttribute('data-filter')] = select.value;
        });

        var visible = 0;
        cards.forEach(function (card) {
          var matchKeyword = !keyword || (card.getAttribute('data-search') || '').indexOf(keyword) !== -1;
          var matchCategory = !values.category || card.getAttribute('data-category') === values.category;
          var matchType = !values.type || card.getAttribute('data-type') === values.type;
          var matchYear = !values.year || card.getAttribute('data-year') === values.year;
          var show = matchKeyword && matchCategory && matchType && matchYear;
          card.style.display = show ? '' : 'none';
          if (show) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }

      if (search) {
        search.addEventListener('input', apply);
      }
      selects.forEach(function (select) {
        select.addEventListener('change', apply);
      });
      apply();
    });
  }

  function initPlayers() {
    $all('.js-player').forEach(function (box) {
      var video = $('video', box);
      var overlay = $('.player-overlay', box);
      var source = box.getAttribute('data-source');
      var hlsInstance = null;

      if (!video || !source) {
        return;
      }

      function attachSource() {
        if (box.getAttribute('data-ready') === 'true') {
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }

        box.setAttribute('data-ready', 'true');
      }

      function play() {
        attachSource();
        box.classList.add('playing');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener('click', play);
      }

      video.addEventListener('click', function () {
        if (box.getAttribute('data-ready') !== 'true') {
          play();
        }
      });

      video.addEventListener('play', function () {
        box.classList.add('playing');
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHeader();
    initHero();
    initFilters();
    initPlayers();
  });
})();
