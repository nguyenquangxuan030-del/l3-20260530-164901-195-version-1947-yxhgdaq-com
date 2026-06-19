import { H as Hls } from "./hls-vendor-dru42stk.js";

const ready = (callback) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
};

const normalize = (value) => (value || "").toString().trim().toLowerCase();

function setupMenu() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const panel = document.querySelector("[data-mobile-panel]");

  if (!toggle || !panel) {
    return;
  }

  toggle.addEventListener("click", () => {
    panel.classList.toggle("open");
  });
}

function setupHero() {
  const slider = document.querySelector("[data-hero-slider]");

  if (!slider) {
    return;
  }

  const slides = Array.from(slider.querySelectorAll(".hero-slide"));
  const prev = slider.querySelector("[data-hero-prev]");
  const next = slider.querySelector("[data-hero-next]");
  const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
  let current = 0;
  let timer = null;

  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, idx) => {
      slide.classList.toggle("active", idx === current);
    });
    dots.forEach((dot, idx) => {
      dot.classList.toggle("active", idx === current);
    });
  };

  const restart = () => {
    if (timer) {
      window.clearInterval(timer);
    }
    timer = window.setInterval(() => show(current + 1), 5200);
  };

  prev?.addEventListener("click", () => {
    show(current - 1);
    restart();
  });

  next?.addEventListener("click", () => {
    show(current + 1);
    restart();
  });

  dots.forEach((dot, idx) => {
    dot.addEventListener("click", () => {
      show(idx);
      restart();
    });
  });

  if (slides.length > 1) {
    restart();
  }
}

function setupFilters() {
  const scopes = document.querySelectorAll("[data-filter-scope]");

  scopes.forEach((scope) => {
    const queryInput = scope.querySelector("[data-filter-query]");
    const regionSelect = scope.querySelector("[data-filter-region]");
    const yearSelect = scope.querySelector("[data-filter-year]");
    const genreSelect = scope.querySelector("[data-filter-genre]");
    const state = scope.querySelector("[data-filter-state]");
    const cards = Array.from(scope.querySelectorAll(".movie-card"));
    const params = new URLSearchParams(window.location.search);

    if (queryInput && params.get("q")) {
      queryInput.value = params.get("q");
    }

    const apply = () => {
      const query = normalize(queryInput?.value);
      const region = normalize(regionSelect?.value);
      const year = normalize(yearSelect?.value);
      const genre = normalize(genreSelect?.value);
      let shown = 0;

      cards.forEach((card) => {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.category
        ].join(" "));
        const passQuery = !query || haystack.includes(query);
        const passRegion = !region || normalize(card.dataset.region).includes(region);
        const passYear = !year || normalize(card.dataset.year) === year;
        const passGenre = !genre || normalize(card.dataset.genre).includes(genre) || normalize(card.dataset.category).includes(genre);
        const visible = passQuery && passRegion && passYear && passGenre;
        card.classList.toggle("hidden-card", !visible);
        if (visible) {
          shown += 1;
        }
      });

      if (state) {
        state.textContent = shown > 0 ? "筛选结果已更新" : "未找到匹配影片";
      }
    };

    [queryInput, regionSelect, yearSelect, genreSelect].forEach((control) => {
      control?.addEventListener("input", apply);
      control?.addEventListener("change", apply);
    });

    apply();
  });
}

function setupPager() {
  const pagers = document.querySelectorAll("[data-pager]");

  pagers.forEach((pager) => {
    const scope = document.querySelector(pager.dataset.pager);
    if (!scope) {
      return;
    }

    const perPage = Number(pager.dataset.perPage || 48);
    const cards = Array.from(scope.querySelectorAll(".movie-card"));
    const pageCount = Math.ceil(cards.length / perPage);

    if (pageCount <= 1) {
      return;
    }

    let page = 1;

    const render = () => {
      cards.forEach((card, index) => {
        const start = (page - 1) * perPage;
        const end = start + perPage;
        card.style.display = index >= start && index < end ? "" : "none";
      });
      pager.querySelectorAll("button").forEach((button) => {
        button.classList.toggle("active", Number(button.dataset.page) === page);
      });
    };

    for (let i = 1; i <= Math.min(pageCount, 8); i += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.page = String(i);
      button.textContent = String(i);
      button.addEventListener("click", () => {
        page = i;
        render();
        scope.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      pager.appendChild(button);
    }

    render();
  });
}

export function initMoviePlayer(source) {
  ready(() => {
    const video = document.querySelector("[data-player]");
    const overlay = document.querySelector("[data-play-overlay]");

    if (!video || !source) {
      return;
    }

    let hls = null;
    let started = false;

    const start = () => {
      if (started) {
        video.play().catch(() => {});
        return;
      }

      started = true;
      overlay?.classList.add("hidden");

      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
        });
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (!data.fatal || !hls) {
            return;
          }
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
            hls = null;
          }
        });
      } else {
        video.src = source;
        video.play().catch(() => {});
      }
    };

    overlay?.addEventListener("click", start);
    video.addEventListener("click", () => {
      if (!started) {
        start();
      }
    });

    window.addEventListener("pagehide", () => {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  });
}

ready(() => {
  setupMenu();
  setupHero();
  setupFilters();
  setupPager();
});
