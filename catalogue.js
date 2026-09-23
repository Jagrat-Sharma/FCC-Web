(() => {
  const $ = id => document.getElementById(id), grid = document.querySelector('.fcc-catalog-grid');
  if (!grid) return;
  document.documentElement.classList.add('fcc-catalogue-page');
  const search = $('fcc-product-search'), sort = $('fcc-product-sort'), size = $('fcc-page-size');
  let page = 1, controller, categoriesReady = false;
  const element = (tag, text, cls) => {
    const e = document.createElement(tag);
    if (text !== undefined) e.textContent = text;
    if (cls) e.className = cls;
    return e;
  };
  const popup = element('dialog', undefined, 'fcc-product-popup');
  popup.setAttribute('aria-labelledby', 'fcc-popup-title');
  document.querySelector('.fcc').append(popup);
  let popupTrigger;
  // Close through the backdrop or explicit close button, not Escape.
  popup.addEventListener('cancel', event => event.preventDefault());
  popup.addEventListener('close', () => {
    document.documentElement.classList.remove('fcc-popup-open');
    if (popupTrigger?.isConnected) popupTrigger.focus({
      preventScroll: true
    });
  });
  let backdropPress = false;
  const outsidePopup = event => {
    const rect = popup.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  };
  popup.addEventListener('pointerdown', event => {
    backdropPress = outsidePopup(event);
  });
  popup.addEventListener('click', event => {
    if (backdropPress && outsidePopup(event)) popup.close();
    backdropPress = false;
  });
  function showProduct(item, trigger) {
    popupTrigger = trigger;
    const close = element('button', '×', 'fcc-popup-close');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close product details');
    close.autofocus = true;
    close.onclick = () => popup.close();
    const layout = element('div', undefined, 'fcc-popup-layout');
    if (item.image_url) {
      const image = element('img', undefined, 'fcc-popup-image');
      image.src = item.image_url;
      image.alt = item.image_alt || item.name;
      layout.append(image);
    } else layout.classList.add('fcc-popup-no-image');
    const content = element('div', undefined, 'fcc-popup-content');
    const title = element('h2', item.name);
    title.id = 'fcc-popup-title';
    content.append(element('p', item.category_name, 'fcc-eyebrow'), title);
    if (item.featured) content.append(element('p', 'Featured product', 'fcc-small'));
    if (item.price_cents != null) content.append(element('p', new Intl.NumberFormat('en-CA', {
      style: 'currency', currency: 'CAD'
    }).format(item.price_cents / 100) + ' CAD ' + item.price_unit, 'fcc-cms-price'));
    content.append(element('p', item.description || 'Contact our team for product details.', 'fcc-cms-description'));
    const link = element('a', 'Enquire about this product', 'fcc-button');
    link.href = 'mailto:firstchoicecarpets@hotmail.com?subject=' + encodeURIComponent('Product enquiry: ' + item.name);
    content.append(link);
    layout.append(content);
    popup.replaceChildren(close, layout);
    document.documentElement.classList.add('fcc-popup-open');
    popup.showModal();
    popup.scrollTop = 0;
  }
  async function json(url, signal) {
    const r = await fetch(url, {
      signal
    });
    if (!r.ok || !r.headers.get('content-type')?.includes('application/json')) throw new Error('Products are temporarily unavailable. Please try again or contact us.');
    return r.json();
  }
  async function load() {
    controller?.abort();
    controller = new AbortController();
    const signal = controller.signal;
    // Leave the current results in place until their replacement is ready.
    grid.setAttribute('aria-busy', 'true');
    $('fcc-product-count').textContent = 'Loading products…';
    $('fcc-load-error').hidden = $('fcc-retry').hidden = true;
    try {
      if (!categoriesReady) {
        const data = await json('/api/categories', signal);
        const box = document.querySelector('.fcc-category-buttons');
        box.replaceChildren();
        for (const category of [{
          slug: 'all', name: 'All products'
        }, ...data.items]) {
          const b = element('button', category.name);
          b.type = 'button';
          b.dataset.category = category.slug;
          b.id = 'filter-' + category.slug;
          b.onclick = () => {
            const url = new URL(location.href);
            url.hash = '';
            if (category.slug === 'all') url.searchParams.delete('category');
            else url.searchParams.set('category', category.slug);
            history.pushState(null, '', url);
            page = 1;
            load();
          };
          box.append(b);
        }
        categoriesReady = true;
        [search,sort,size,$('fcc-reset-filters')].forEach(e => e.disabled = false);
      }
      const requestedCategory = new URLSearchParams(location.search).get('category') || '';
      const category = [...document.querySelectorAll('button[data-category]')].some(b => b.dataset.category === requestedCategory) ? requestedCategory : 'all';
      document.querySelectorAll('button[data-category]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.category === category)));
      const data = await json('/api/products?' + new URLSearchParams({
        page, limit: size.value, q: search.value, sort: sort.value, ...(category !== 'all' ? {
          category
        }
        : {
        })
      }), signal);
      if (signal.aborted) return;
      const nextCards = document.createDocumentFragment();
      for (const item of data.items) {
        const card = element('article', undefined, 'fcc-catalog-card');
        if (item.image_url) {
          const img = element('img', undefined, 'fcc-cms-product-image');
          img.src = item.image_url;
          img.alt = item.image_alt;
          img.loading = 'lazy';
          card.append(img);
        } else card.append(element('div', 'Image coming soon', 'fcc-cms-no-image'));
        const body = element('div', undefined, 'fcc-card-body');
        body.append(element('p', item.category_name, 'fcc-card-category'), element('h2', item.name));
        if (item.featured) body.append(element('p', 'Featured', 'fcc-small'));
        if (item.price_cents !== null) body.append(element('p', new Intl.NumberFormat('en-CA', {
          style: 'currency', currency: 'CAD'
        }).format(item.price_cents / 100) + ' CAD ' + item.price_unit, 'fcc-cms-price'));
        const details = element('button', 'View details', 'fcc-button fcc-view-details');
        details.type = 'button';
        details.setAttribute('aria-haspopup', 'dialog');
        details.setAttribute('aria-label', 'View details for ' + item.name);
        details.onclick = () => showProduct(item, details);
        body.append(details);
        card.append(body);
        nextCards.append(card);
      }
      // One DOM update avoids temporarily collapsing the catalogue under the viewport.
      const viewport = {
        left: window.scrollX, top: window.scrollY, behavior: 'instant'
      };
      grid.replaceChildren(nextCards);
      $('fcc-product-count').textContent = data.total ? `Showing ${(page - 1) * data.limit + 1}–${(page - 1) * data.limit + data.items.length} of ${data.total} products` : 'No products found';
      $('fcc-no-products').hidden = data.items.length > 0;
      $('fcc-pagination').hidden = data.total <= data.limit;
      $('fcc-page-label').textContent = `Page ${page} of ${Math.max(1, Math.ceil(data.total / data.limit))}`;
      $('fcc-previous').disabled = page <= 1;
      $('fcc-next').disabled = page * data.limit >= data.total;
      window.scrollTo(viewport);
    } catch (e) {
      if (e.name === 'AbortError') return;
      $('fcc-product-count').textContent = '';
      $('fcc-load-error').textContent = e.message;
      $('fcc-load-error').hidden = $('fcc-retry').hidden = false;
    } finally {
      if (!signal.aborted) {
        grid.setAttribute('aria-busy', 'false');
      }
    }
  }
  let timer;
  search.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      page = 1;
      load();
    }, 300);
  });
  [sort,size].forEach(e => e.addEventListener('change', () => {
    page = 1;
    load();
  }));
  addEventListener('popstate', () => {
    page = 1;
    load();
  });
  $('fcc-reset-filters').onclick = () => {
    search.value = '';
    sort.value = 'featured';
    page = 1;
    history.replaceState(null, '', location.pathname);
    load();
  };
  $('fcc-previous').onclick = () => {
    page--;
    load();
  };
  $('fcc-next').onclick = () => {
    page++;
    load();
  };
  $('fcc-retry').onclick = load;
  // Old category bookmarks become filters, not scroll targets.
  if (location.hash.startsWith('#fcc-') && location.hash !== '#fcc-home') {
    const url = new URL(location.href);
    url.searchParams.set('category', location.hash.slice(5));
    url.hash = '';
    history.replaceState(null, '', url);
  }
  load();
})();
