(() => {
  const grid = document.querySelector('.fcc-catalog-grid');
  if (!grid) return;
  const cards = [...grid.children];
  const search = document.getElementById('fcc-product-search');
  const sort = document.getElementById('fcc-product-sort');
  const size = document.getElementById('fcc-page-size');
  const buttons = [...document.querySelectorAll('button[data-category]')];
  const reset = document.getElementById('fcc-reset-filters');
  const previous = document.getElementById('fcc-previous');
  const next = document.getElementById('fcc-next');
  let category = 'all';
  let page = 1;
  function updateCategoryURL() {
    const url = new URL(location.href);
    url.hash = category === 'all' ? '' : `fcc-${category}`;
    // Some local-file browsers restrict history updates. Filtering must still work.
    try { history.replaceState(null, '', url.href); } catch { /* URL sync is optional. */ }
  }
  document.querySelectorAll('.fcc-catalog [disabled]').forEach(control => { control.disabled = false; });
  function render() {
    const query = search.value.trim().toLowerCase();
    const filtered = cards.filter(card => (category === 'all' || card.dataset.category === category)
      && `${card.dataset.name} ${card.dataset.label}`.toLowerCase().includes(query));
    if (sort.value !== 'featured') filtered.sort((a, b) =>
      a.dataset.name.localeCompare(b.dataset.name) * (sort.value === 'az' ? 1 : -1));
    const limit = Number(size.value);
    const pages = Math.max(1, Math.ceil(filtered.length / limit));
    page = Math.min(page, pages);
    const start = (page - 1) * limit;
    cards.forEach(card => { card.hidden = true; });
    filtered.forEach((card, index) => {
      grid.appendChild(card);
      card.hidden = index < start || index >= start + limit;
    });
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === category)));
    document.getElementById('fcc-product-count').textContent = filtered.length
      ? `Showing ${start + 1}–${Math.min(start + limit, filtered.length)} of ${filtered.length} sample products`
      : '0 matching products';
    document.getElementById('fcc-no-products').hidden = filtered.length !== 0;
    document.getElementById('fcc-pagination').hidden = pages < 2;
    document.getElementById('fcc-page-label').textContent = `Page ${page} of ${pages}`;
    previous.disabled = page === 1;
    next.disabled = page === pages;
  }
  function fromHash() {
    const slug = location.hash.replace(/^#fcc-/, '');
    category = buttons.some(button => button.dataset.category === slug) ? slug : 'all';
    page = 1;
    render();
  }
  buttons.forEach(button => button.addEventListener('click', () => {
    category = button.dataset.category;
    page = 1;
    updateCategoryURL();
    render();
  }));
  search.addEventListener('input', () => { page = 1; render(); });
  [sort, size].forEach(control => control.addEventListener('change', () => { page = 1; render(); }));
  reset.addEventListener('click', () => {
    search.value = ''; sort.value = 'featured'; size.value = '12'; category = 'all'; page = 1;
    updateCategoryURL();
    render();
  });
  previous.addEventListener('click', () => { page--; render(); });
  next.addEventListener('click', () => { page++; render(); });
  window.addEventListener('hashchange', fromHash);
  fromHash();
})();
