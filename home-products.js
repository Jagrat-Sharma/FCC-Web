// The public endpoint returns only products enabled for display on the website.
(() => {
  const grid = document.getElementById('fcc-home-products');
  if (!grid) return;

  const status = document.getElementById('fcc-home-products-status');
  const retry = document.getElementById('fcc-home-products-retry');

  function createCard(product) {
    const card = document.createElement('a');
    card.className = 'fcc-home-product';
    card.href = 'products.html?' + new URLSearchParams({ q: product.name });

    if (product.image_url) {
      const image = document.createElement('img');
      image.src = product.image_url;
      image.alt = product.image_alt || product.name;
      image.loading = 'lazy';
      image.width = 600;
      image.height = 450;
      card.append(image);
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'fcc-home-product-placeholder';
      placeholder.textContent = 'Image coming soon';
      card.append(placeholder);
    }

    const body = document.createElement('div');
    const category = document.createElement('p');
    category.textContent = product.category_name;
    const heading = document.createElement('h3');
    heading.textContent = product.name;
    body.append(category, heading);
    card.append(body);
    return card;
  }

  async function loadProducts() {
    grid.setAttribute('aria-busy', 'true');
    retry.hidden = true;
    status.textContent = 'Loading products…';
    try {
      const response = await fetch('/api/products?limit=6&sort=featured');
      if (!response.ok) throw new Error('Unable to load products');
      const data = await response.json();
      if (!Array.isArray(data.items)) throw new Error('Invalid response');
      grid.replaceChildren(...data.items.map(createCard));
      status.textContent = data.items.length ? '' : 'Our product selection will be available soon. Contact us to explore your options.';
    } catch {
      status.textContent = 'Products are temporarily unavailable. Please try again.';
      retry.hidden = false;
    } finally {
      grid.setAttribute('aria-busy', 'false');
    }
  }

  retry.addEventListener('click', loadProducts);
  loadProducts();
})();
