
(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mainNav = document.querySelector('[data-main-nav]');

    if (menuButton && mainNav) {
        menuButton.addEventListener('click', function () {
            mainNav.classList.toggle('open');
        });
    }

    document.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
            image.style.opacity = '0';
            image.closest('.poster-shell, .hero-poster, .detail-poster, .rank-thumb, .rank-hero-item');
        });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')));
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide((current + 1) % slides.length);
            }, 5600);
        }
    }

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
        var input = panel.querySelector('[data-filter-input]');
        var yearSelect = panel.querySelector('[data-year-filter]');
        var grid = document.querySelector('[data-filter-grid]');

        if (!grid) {
            return;
        }

        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function applyFilter() {
            var keyword = normalize(input ? input.value : '');
            var year = yearSelect ? yearSelect.value : '';

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-year')
                ].join(' '));
                var cardYear = Number(card.getAttribute('data-year') || 0);
                var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
                var yearMatch = !year || String(cardYear) === year || (year === '2021' && cardYear <= 2021);
                card.style.display = keywordMatch && yearMatch ? '' : 'none';
            });
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }
        if (yearSelect) {
            yearSelect.addEventListener('change', applyFilter);
        }
    });
})();
