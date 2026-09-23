(() => {
  const cards = [...document.querySelectorAll('.fcc-flooring-card')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (!cards.length || motion.matches || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.remove('fcc-card-waiting');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.12 });
  cards.forEach(card => { card.classList.add('fcc-card-waiting'); observer.observe(card); });
  // Keyboard navigation must never focus a visually hidden link.
  cards.forEach(card => card.addEventListener('focus', () => card.classList.remove('fcc-card-waiting')));
  motion.addEventListener('change', () => {
    if (motion.matches) { cards.forEach(card => card.classList.remove('fcc-card-waiting')); observer.disconnect(); }
  });
})();
