(function () {
    const header = document.querySelector('[data-site-header]');
    const mobileButton = document.querySelector('[data-mobile-menu]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (header) {
        const syncHeader = () => {
            header.classList.toggle('scrolled', window.scrollY > 40);
        };
        syncHeader();
        window.addEventListener('scroll', syncHeader, { passive: true });
    }

    if (mobileButton && mobileNav) {
        mobileButton.addEventListener('click', () => {
            mobileNav.classList.toggle('open');
        });
    }

    document.querySelectorAll('[data-hero-slider]').forEach((slider) => {
        const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
        const prev = slider.querySelector('[data-hero-prev]');
        const next = slider.querySelector('[data-hero-next]');
        let current = 0;
        let timer = null;

        const show = (index) => {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle('active', dotIndex === current);
            });
        };

        const restart = () => {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(() => show(current + 1), 6000);
        };

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                show(index);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', () => {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', () => {
                show(current + 1);
                restart();
            });
        }

        show(0);
        restart();
    });

    document.querySelectorAll('[data-filter-panel]').forEach((panel) => {
        const input = panel.querySelector('[data-filter-input]');
        const yearFilter = panel.querySelector('[data-year-filter]');
        const counter = panel.querySelector('[data-filter-count]');
        const list = panel.parentElement.querySelector('[data-card-list]');
        const cards = list ? Array.from(list.querySelectorAll('[data-movie-card]')) : [];

        const urlQuery = new URLSearchParams(window.location.search).get('q');
        if (input && urlQuery) {
            input.value = urlQuery;
        }

        const applyFilter = () => {
            const query = input ? input.value.trim().toLowerCase() : '';
            const year = yearFilter ? yearFilter.value : '';
            let shown = 0;

            cards.forEach((card) => {
                const haystack = [
                    card.dataset.title,
                    card.dataset.genre,
                    card.dataset.year,
                    card.dataset.region,
                    card.dataset.type,
                    card.textContent
                ].join(' ').toLowerCase();
                const matchQuery = !query || haystack.includes(query);
                const matchYear = !year || card.dataset.year === year;
                const visible = matchQuery && matchYear;
                card.hidden = !visible;
                if (visible) {
                    shown += 1;
                }
            });

            if (counter) {
                counter.textContent = shown + ' 部影片';
            }
        };

        if (input) {
            input.addEventListener('input', applyFilter);
        }
        if (yearFilter) {
            yearFilter.addEventListener('change', applyFilter);
        }
        applyFilter();
    });

    document.querySelectorAll('[data-player]').forEach((player) => {
        const video = player.querySelector('video[data-src]');
        const button = player.querySelector('[data-play-button]');
        let hlsInstance = null;
        let loaded = false;

        const loadVideo = () => {
            if (!video || loaded) {
                return;
            }

            const source = video.dataset.src;
            if (!source) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }

            loaded = true;
        };

        const startPlayback = () => {
            loadVideo();
            if (button) {
                button.classList.add('hidden');
            }
            const playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(() => {
                    video.controls = true;
                });
            }
        };

        if (button && video) {
            button.addEventListener('click', startPlayback);
        }

        if (video) {
            video.addEventListener('play', () => {
                if (button) {
                    button.classList.add('hidden');
                }
            });
        }

        window.addEventListener('beforeunload', () => {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
