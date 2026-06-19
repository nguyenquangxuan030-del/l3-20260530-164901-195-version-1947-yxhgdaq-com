document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', () => {
      mobilePanel.classList.toggle('is-open');
    });
  }

  const filterInput = document.querySelector('[data-filter-input]');
  const filterScope = document.querySelector('[data-filter-scope]');
  const emptyState = document.querySelector('[data-empty-state]');

  if (filterInput && filterScope) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';

    if (query) {
      filterInput.value = query;
    }

    const applyFilter = () => {
      const value = filterInput.value.trim().toLowerCase();
      const items = Array.from(filterScope.querySelectorAll('[data-search]'));
      let visibleCount = 0;

      items.forEach((item) => {
        const text = item.getAttribute('data-search') || '';
        const isVisible = !value || text.includes(value);
        item.style.display = isVisible ? '' : 'none';
        if (isVisible) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visibleCount === 0);
      }
    };

    filterInput.addEventListener('input', applyFilter);
    applyFilter();
  }

  const slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    const slides = Array.from(slider.querySelectorAll('.hero-slide'));
    const dots = Array.from(slider.querySelectorAll('[data-hero-dots] button'));
    let activeIndex = 0;
    let timer = null;

    const showSlide = (index) => {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    };

    const startTimer = () => {
      timer = window.setInterval(() => {
        showSlide(activeIndex + 1);
      }, 5600);
    };

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        if (timer) {
          window.clearInterval(timer);
        }
        showSlide(index);
        startTimer();
      });
    });

    if (slides.length > 1) {
      startTimer();
    }
  }
});
