const headerButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');

if (headerButton && mobileNav) {
  headerButton.addEventListener('click', () => {
    mobileNav.classList.toggle('is-open');
  });
}

const slides = Array.from(document.querySelectorAll('.hero-slide'));
const dots = Array.from(document.querySelectorAll('.hero-dot'));
let currentSlide = 0;

function showSlide(index) {
  if (!slides.length) {
    return;
  }
  currentSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, itemIndex) => {
    slide.classList.toggle('active', itemIndex === currentSlide);
  });
  dots.forEach((dot, itemIndex) => {
    dot.classList.toggle('active', itemIndex === currentSlide);
  });
}

dots.forEach((dot) => {
  dot.addEventListener('click', () => {
    showSlide(Number(dot.dataset.target || 0));
  });
});

if (slides.length > 1) {
  window.setInterval(() => {
    showSlide(currentSlide + 1);
  }, 5600);
}

const searchInputs = Array.from(document.querySelectorAll('.movie-search'));

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function filterCards(value) {
  const keyword = normalize(value);
  const cards = Array.from(document.querySelectorAll('.movie-card, .compact-card'));
  cards.forEach((card) => {
    const haystack = normalize([
      card.dataset.title,
      card.dataset.genre,
      card.dataset.year,
      card.dataset.region,
      card.dataset.type,
      card.textContent
    ].join(' '));
    card.classList.toggle('is-filtered-out', keyword && !haystack.includes(keyword));
  });
}

searchInputs.forEach((input) => {
  input.addEventListener('input', () => {
    filterCards(input.value);
  });
});

async function prepareVideo(video) {
  const stream = video.getAttribute('data-stream');
  if (!stream) {
    return;
  }
  if (video.dataset.ready === 'true') {
    return;
  }
  video.dataset.ready = 'true';
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = stream;
    return;
  }
  const module = await import('./hls-vendor.js');
  const Hls = module.H;
  if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    hls.loadSource(stream);
    hls.attachMedia(video);
    video._hls = hls;
  } else {
    video.src = stream;
  }
}

Array.from(document.querySelectorAll('.video-shell')).forEach((shell) => {
  const video = shell.querySelector('video');
  const cover = shell.querySelector('.player-cover');
  if (!video || !cover) {
    return;
  }
  const start = async () => {
    await prepareVideo(video);
    cover.classList.add('is-hidden');
    const playTask = video.play();
    if (playTask && typeof playTask.catch === 'function') {
      playTask.catch(() => {
        cover.classList.remove('is-hidden');
      });
    }
  };
  cover.addEventListener('click', start);
  video.addEventListener('click', () => {
    if (video.paused) {
      start();
    }
  });
});
