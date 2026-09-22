(() => {
  const $ = id => document.getElementById(id), grid = document.querySelector('.fcc-catalog-grid');
  if (!grid) return;
  document.documentElement.classList.add('fcc-catalogue-page');
  const search = $('fcc-product-search'), sort = $('fcc-product-sort'), size = $('fcc-page-size');
  let page = 1, controller, categoriesReady = false;
  const element = (tag, text, cls) => { const e = document.createElement(tag); if (text !== undefined) e.textContent = text; if (cls) e.className = cls; return e; };
  async function json(url, signal) { const r = await fetch(url, { signal }); if (!r.ok || !r.headers.get('content-type')?.includes('application/json')) throw new Error('Products are temporarily unavailable. Please try again or contact us.'); return r.json(); }
  async function load() {
    controller?.abort(); controller = new AbortController(); const signal = controller.signal;
    // Leave the current results in place until their replacement is ready.
    grid.setAttribute('aria-busy', 'true'); $('fcc-product-count').textContent = 'Loading products…'; $('fcc-load-error').hidden = $('fcc-retry').hidden = true;
    try {
      if (!categoriesReady) {
        const data = await json('/api/categories', signal); const box = document.querySelector('.fcc-category-buttons'); box.replaceChildren();
        for (const category of [{ slug: 'all', name: 'All products' }, ...data.items]) { const b = element('button', category.name); b.type = 'button'; b.dataset.category = category.slug; b.id = 'filter-' + category.slug; b.onclick = () => { const url = new URL(location.href); url.hash = ''; if (category.slug === 'all') url.searchParams.delete('category'); else url.searchParams.set('category', category.slug); history.pushState(null, '', url); page = 1; load(); }; box.append(b); }
        categoriesReady = true; [search,sort,size,$('fcc-reset-filters')].forEach(e => e.disabled = false);
      }
      const requestedCategory = new URLSearchParams(location.search).get('category') || '';
      const category = [...document.querySelectorAll('button[data-category]')].some(b => b.dataset.category === requestedCategory) ? requestedCategory : 'all';
      document.querySelectorAll('button[data-category]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.category === category)));
      const data = await json('/api/products?' + new URLSearchParams({ page, limit: size.value, q: search.value, sort: sort.value, ...(category !== 'all' ? { category } : {}) }), signal);
      if (signal.aborted) return;
      const nextCards = document.createDocumentFragment();
      for (const item of data.items) {
        const card = element('article', undefined, 'fcc-catalog-card');
        if (item.image_url) { const img = element('img', undefined, 'fcc-cms-product-image'); img.src = item.image_url; img.alt = item.image_alt; img.loading = 'lazy'; card.append(img); }
        else card.append(element('div', 'Image coming soon', 'fcc-cms-no-image'));
        const body = element('div', undefined, 'fcc-card-body'); body.append(element('p', item.category_name, 'fcc-card-category'), element('h2', item.name));
        if (item.featured) body.append(element('p', 'Featured', 'fcc-small'));
        if (item.price_cents !== null) body.append(element('p', new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(item.price_cents / 100) + ' CAD ' + item.price_unit, 'fcc-cms-price'));
        const details = element('details', undefined, 'fcc-product-details'), content = element('div'); details.append(element('summary', 'View details +')); content.append(element('p', item.description || 'Contact our team for product details.', 'fcc-cms-description'));
        const link = element('a', 'Enquire about this product', 'fcc-button'); link.href = 'mailto:firstchoicecarpets@hotmail.com?subject=' + encodeURIComponent('Product enquiry: ' + item.name); content.append(link); details.append(content); body.append(details); card.append(body); nextCards.append(card);
      }
      // One DOM update avoids temporarily collapsing the catalogue under the viewport.
      const viewport = { left: window.scrollX, top: window.scrollY, behavior: 'instant' };
      grid.replaceChildren(nextCards);
      $('fcc-product-count').textContent = data.total ? `Showing ${(page - 1) * data.limit + 1}–${(page - 1) * data.limit + data.items.length} of ${data.total} products` : 'No products found';
      $('fcc-no-products').hidden = data.items.length > 0; $('fcc-pagination').hidden = data.total <= data.limit; $('fcc-page-label').textContent = `Page ${page} of ${Math.max(1, Math.ceil(data.total / data.limit))}`; $('fcc-previous').disabled = page <= 1; $('fcc-next').disabled = page * data.limit >= data.total;
      window.scrollTo(viewport);
    } catch (e) { if (e.name === 'AbortError') return; $('fcc-product-count').textContent = ''; $('fcc-load-error').textContent = e.message; $('fcc-load-error').hidden = $('fcc-retry').hidden = false; }
    finally { if (!signal.aborted) { grid.setAttribute('aria-busy', 'false'); } }
  }
  let timer; search.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => { page = 1; load(); }, 300); });
  [sort,size].forEach(e => e.addEventListener('change', () => { page = 1; load(); }));
  addEventListener('popstate', () => { page = 1; load(); });
  $('fcc-reset-filters').onclick = () => { search.value = ''; sort.value = 'featured'; page = 1; history.replaceState(null, '', location.pathname); load(); };
  $('fcc-previous').onclick = () => { page--; load(); }; $('fcc-next').onclick = () => { page++; load(); }; $('fcc-retry').onclick = load;
  // Old category bookmarks become filters, not scroll targets.
  if (location.hash.startsWith('#fcc-') && location.hash !== '#fcc-home') {
    const url = new URL(location.href); url.searchParams.set('category', location.hash.slice(5)); url.hash = ''; history.replaceState(null, '', url);
  }
  load();
})();
