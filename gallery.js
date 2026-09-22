(() => {
  const grid = document.getElementById('gallery-grid'), status = document.getElementById('gallery-status'), button = document.getElementById('gallery-more');
  if (!grid) return;
  let page = 1, busy = false;
  async function load() {
    if (busy) return; busy = true; button.disabled = true; status.textContent = 'Loading gallery…';
    try {
      const response = await fetch('/api/gallery?page=' + page + '&limit=12');
      if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error('The gallery is temporarily unavailable.');
      const data = await response.json();
      for (const item of data.items) {
        const figure = document.createElement('figure'), img = document.createElement('img'), caption = document.createElement('figcaption'), title = document.createElement('strong'), description = document.createElement('span');
        img.src = item.image_url; img.alt = item.image_alt; img.loading = 'lazy'; title.textContent = item.title; description.textContent = item.description; caption.append(title, description); figure.append(img, caption); grid.append(figure);
      }
      status.textContent = data.total ? `Showing ${grid.children.length} of ${data.total} images` : 'Our gallery is being updated. Please check back soon.';
      button.hidden = page * data.limit >= data.total; button.textContent = 'Load more'; page++;
    } catch (e) { status.textContent = e.message; button.hidden = false; button.textContent = 'Try again'; }
    finally { busy = false; button.disabled = false; }
  }
  button.onclick = load; load();
})();
