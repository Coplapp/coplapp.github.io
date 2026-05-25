/**
 * Scroll-reveal: gör element synliga när de scrollas in i vyn.
 * Använder Intersection Observer (modern, batteri-snäll).
 * Faller tillbaka till "visa allt direkt" om inte stöds.
 */
(function () {
  if (typeof IntersectionObserver === 'undefined') {
    // Äldre webbläsare - visa allt direkt
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    },
  );

  document.querySelectorAll('.reveal').forEach((el, i) => {
    // Stagger-delay för grid-items
    el.style.setProperty('--stagger', i % 6);
    observer.observe(el);
  });
})();
