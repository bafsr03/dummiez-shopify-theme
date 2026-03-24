(function () {
  'use strict';

  // Respect user motion preference and skip on very low-power devices
  if (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    Number(navigator.hardwareConcurrency) <= 2
  ) {
    document.body.classList.add('page-loaded');
    return;
  }

  const REVEAL_THRESHOLD = 0.08;
  const STAGGER_DELAY_MS = 75;
  const STAGGER_CAP = 10; // never delay past the 10th item
  const ABOVE_FOLD_DELAY_MS = 80; // slight delay so above-fold items animate in nicely

  /**
   * Assign --stagger-i custom property to grid children so CSS can stagger them.
   * @param {Element} section
   */
  function assignStaggerIndices(section) {
    const grids = section.querySelectorAll(
      '.product-grid, .collection-list__grid, .resource-list, .featured-blog-posts__grid'
    );
    grids.forEach((grid) => {
      grid.classList.add('reveal-stagger');
      Array.from(grid.children).forEach((child, i) => {
        child.style.setProperty('--stagger-i', Math.min(i, STAGGER_CAP));
      });
    });
  }

  /**
   * Reveal a section (adds is-revealed class in next paint).
   * @param {Element} el
   */
  function reveal(el) {
    requestAnimationFrame(() => {
      el.classList.add('is-revealed');
    });
  }

  /**
   * Returns true if the element is in the initial viewport on page load.
   * @param {Element} el
   * @returns {boolean}
   */
  function isAboveFold(el) {
    const rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight * 1.1 && rect.bottom > 0;
  }

  function init() {
    const sections = Array.from(document.querySelectorAll('.shopify-section'));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          reveal(entry.target);
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: REVEAL_THRESHOLD,
        rootMargin: '0px 0px -24px 0px',
      }
    );

    sections.forEach((section) => {
      // Skip header and any section that opts out
      if (section.closest('#header-group') || section.hasAttribute('data-no-reveal')) return;

      section.classList.add('reveal-on-scroll');
      assignStaggerIndices(section);

      if (isAboveFold(section)) {
        // Above-fold: reveal after a small delay to create a nice entrance
        setTimeout(() => reveal(section), ABOVE_FOLD_DELAY_MS);
      } else {
        // Below-fold: reveal on scroll
        observer.observe(section);
      }
    });

    // Signal the page has loaded (triggers header animation)
    document.body.classList.add('page-loaded');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    requestAnimationFrame(init);
  }
})();
