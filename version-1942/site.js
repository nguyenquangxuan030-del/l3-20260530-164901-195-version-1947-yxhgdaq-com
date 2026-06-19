
(function () {
  const byId = (id) => document.getElementById(id);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function setActiveNav() {
    const path = location.pathname.split('/').pop() || 'index.html';
    qsa('[data-nav]').forEach((a) => {
      if (a.getAttribute('href') === '/' + path || (path === '' && a.getAttribute('href') === '/index.html')) {
        a.classList.add('active');
      }
    });
  }

  function initMobileMenu() {
    const btn = byId('menuBtn');
    const nav = byId('siteNav');
    const mini = byId('searchMini');
    if (mini) {
      mini.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          location.href = '/search.html?q=' + encodeURIComponent(mini.value);
        }
      });
    }
    if (!btn || !nav) return;
    btn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
  }

  function initHeroCarousel() {
    const frame = byId('heroCarousel');
    if (!frame) return;
    const slides = qsa('.carousel-slide', frame);
    const dots = qsa('.dot', frame);
    const prev = frame.querySelector('[data-prev]');
    const next = frame.querySelector('[data-next]');
    let index = Math.max(0, slides.findIndex((s) => s.classList.contains('active')));
    if (index < 0) index = 0;
    let timer = null;

    const paint = (i) => {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, idx) => s.classList.toggle('active', idx === index));
      dots.forEach((d, idx) => d.classList.toggle('active', idx === index));
    };
    const start = () => { stop(); timer = setInterval(() => paint(index + 1), 6000); };
    const stop = () => { if (timer) clearInterval(timer); timer = null; };

    prev && prev.addEventListener('click', () => { paint(index - 1); start(); });
    next && next.addEventListener('click', () => { paint(index + 1); start(); });
    dots.forEach((d, idx) => d.addEventListener('click', () => { paint(idx); start(); }));
    frame.addEventListener('mouseenter', stop);
    frame.addEventListener('mouseleave', start);
    paint(index);
    start();
  }

  function resolvePlayer(container) {
    if (!container) return;
    const video = container.querySelector('video');
    const overlay = container.querySelector('.player-cover');
    const button = container.querySelector('.play-btn');
    const source = container.dataset.src;
    if (!video || !source) return;

    let started = false;
    const playOnce = async () => {
      if (started) return;
      started = true;
      try {
        if (window.Hls && window.Hls.isSupported()) {
          const hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 30,
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
          hls.on(window.Hls.Events.ERROR, (_, data) => {
            if (data && data.fatal) {
              try { hls.destroy(); } catch (e) {}
              video.src = source;
              video.play().catch(() => {});
            }
          });
          container.__hls = hls;
        } else {
          video.src = source;
          video.play().catch(() => {});
        }
        overlay && overlay.classList.add('is-hidden');
      } catch (err) {
        video.src = source;
        overlay && overlay.classList.add('is-hidden');
        video.play().catch(() => {});
      }
    };

    button && button.addEventListener('click', playOnce);
    overlay && overlay.addEventListener('click', playOnce);
    video.addEventListener('click', playOnce);
    container.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') playOnce();
    });
  }

  function initPlayers() {
    qsa('[data-player]').forEach(resolvePlayer);
  }

  function cardMarkup(m) {
    const cover = m.cover || './1.jpg';
    return `
      <a class="movie-card" href="/${m.slug}.html" aria-label="${escapeHtml(m.title)}">
        <div class="cover" style="--cover:url('${cover}')">
          <div class="cover-badge">${escapeHtml(m.year || '')}</div>
          <div class="cover-tag">${escapeHtml(m.category_name || '')}</div>
        </div>
        <div class="card-body">
          <h3>${escapeHtml(m.title)}</h3>
          <div class="meta-row">
            <span>${escapeHtml(m.region || '')}</span>
            <span>${escapeHtml(m.type || '')}</span>
            <span>${escapeHtml(m.genre || '')}</span>
          </div>
          <p>${escapeHtml((m.one_line || m.summary || m.review || '').replace(/\s+/g, ' ').slice(0, 86))}</p>
        </div>
      </a>`;
  }

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initSearchPage() {
    const root = byId('searchApp');
    if (!root || !window.MOVIES) return;
    const input = byId('searchInput');
    const region = byId('regionFilter');
    const type = byId('typeFilter');
    const category = byId('categoryFilter');
    const year = byId('yearFilter');
    const results = byId('searchResults');
    const status = byId('searchStatus');

    const params = new URLSearchParams(location.search);
    if (params.get('q') && input) input.value = params.get('q');
    if (params.get('c') && category) category.value = params.get('c');
    const clearBtn = byId('clearFilters');

    const cats = [...new Set(window.MOVIES.map(m => m.category_name).filter(Boolean))];
    if (category && category.options.length <= 1) {
      cats.forEach((c) => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        category.appendChild(opt);
      });
    }

    const years = [...new Set(window.MOVIES.map(m => String(m.year).match(/\d{4}/)?.[0]).filter(Boolean))].sort((a,b)=>b-a);
    if (year && year.options.length <= 1) {
      years.slice(0, 20).forEach((y) => {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y;
        year.appendChild(opt);
      });
    }

    const render = () => {
      const q = (input?.value || '').trim().toLowerCase();
      const rv = region?.value || '';
      const tv = type?.value || '';
      const cv = category?.value || '';
      const yv = year?.value || '';
      const filtered = window.MOVIES.filter((m) => {
        const blob = [m.title, m.region, m.type, m.year, m.genre, m.tags, m.one_line, m.summary, m.review, m.category_name].join(' ').toLowerCase();
        if (q && !blob.includes(q)) return false;
        if (rv && (m.region || '') !== rv) return false;
        if (tv && (m.type || '') !== tv) return false;
        if (cv && (m.category_name || '') !== cv) return false;
        if (yv && String(m.year).match(/\d{4}/)?.[0] !== yv) return false;
        return true;
      });
      const limited = filtered.slice(0, 300);
      results.innerHTML = limited.map(cardMarkup).join('');
      status.textContent = `已找到 ${filtered.length} 条，当前展示 ${limited.length} 条`;
    };
    [input, region, type, category, year].forEach((el) => el && el.addEventListener('input', render));
    clearBtn && clearBtn.addEventListener('click', () => {
      if (input) input.value = '';
      if (region) region.value = '';
      if (type) type.value = '';
      if (category) category.value = '';
      if (year) year.value = '';
      render();
    });
    render();
  }

  function initAnchors() {
    qsa('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setActiveNav();
    initMobileMenu();
    initHeroCarousel();
    initPlayers();
    initSearchPage();
    initAnchors();
  });
})();
