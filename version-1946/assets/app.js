
(function () {
  const currentScript = document.currentScript;
  const assetBase = currentScript ? new URL(".", currentScript.src) : new URL("./assets/", window.location.href);
  const mobileButton = document.querySelector("[data-menu-button]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    let activeIndex = 0;

    function activateHero(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        const index = Number(dot.getAttribute("data-hero-dot"));
        activateHero(index);
      });
    });

    window.setInterval(function () {
      activateHero(activeIndex + 1);
    }, 5200);
  }

  let hlsLoaderPromise = null;

  function loadHlsScript() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsLoaderPromise) {
      return hlsLoaderPromise;
    }

    hlsLoaderPromise = new Promise(function (resolve, reject) {
      const script = document.createElement("script");
      script.src = new URL("hls-global.js", assetBase).href;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });

    return hlsLoaderPromise;
  }

  async function setupHls(video, sourceUrl) {
    if (!video || !sourceUrl) {
      return;
    }

    const nativeHls = video.canPlayType("application/vnd.apple.mpegurl");

    if (nativeHls) {
      video.src = sourceUrl;
      return;
    }

    try {
      const Hls = await loadHlsScript();

      if (Hls && Hls.isSupported && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false
        });

        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        video._hlsInstance = hls;
        return;
      }
    } catch (error) {
      video.dataset.playerError = "hls-load-failed";
    }

    video.src = sourceUrl;
  }

  document.querySelectorAll("[data-player]").forEach(function (player) {
    const video = player.querySelector("video");
    const button = player.querySelector("[data-play-button]");
    const sourceUrl = video ? video.getAttribute("data-video-url") : "";
    let prepared = false;

    async function startPlayback() {
      if (!video) {
        return;
      }

      if (!prepared) {
        prepared = true;
        await setupHls(video, sourceUrl);
      }

      if (button) {
        button.classList.add("is-hidden");
      }

      video.controls = true;

      try {
        await video.play();
      } catch (error) {
        video.focus();
      }
    }

    if (button) {
      button.addEventListener("click", startPlayback);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          startPlayback();
        }
      });
    }
  });

  const searchInput = document.querySelector("[data-search-input]");
  const searchResults = document.querySelector("[data-search-results]");

  if (searchInput && searchResults && Array.isArray(window.MOVIE_SEARCH_DATA)) {
    function createCard(movie) {
      const tags = Array.isArray(movie.tags) ? movie.tags.slice(0, 3).join(" · ") : "";

      return [
        '<article class="compact-card">',
        '<a href="' + movie.url + '">',
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '<span>' + escapeHtml(movie.title) + '</span>',
        '</a>',
        '<small>' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year) + ' · ' + escapeHtml(tags) + '</small>',
        '</article>'
      ].join("");
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function renderSearch() {
      const query = searchInput.value.trim().toLowerCase();
      const source = window.MOVIE_SEARCH_DATA;
      const results = query
        ? source.filter(function (movie) {
            const text = [
              movie.title,
              movie.region,
              movie.type,
              movie.year,
              movie.genre,
              movie.oneLine,
              Array.isArray(movie.tags) ? movie.tags.join(" ") : ""
            ].join(" ").toLowerCase();

            return text.indexOf(query) !== -1;
          }).slice(0, 96)
        : source.slice(0, 24);

      searchResults.innerHTML = '<div class="compact-grid">' + results.map(createCard).join("") + '</div>';
    }

    searchInput.addEventListener("input", renderSearch);
  }
})();
