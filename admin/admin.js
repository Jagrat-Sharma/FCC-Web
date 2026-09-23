import { labels, categoryFields } from '/product-fields.js';
const $ = id => document.getElementById(id);
const form = $('edit-form'), field = name => form.elements.namedItem(name);
const view = document.body.dataset.view;
const parameters = new URLSearchParams(location.search);
let categories = [];
let kind = ['products', 'gallery', 'media'].includes(parameters.get('section')) ? parameters.get('section') : 'products';
let page = 1, current = null, imageId = null, busy = false, sequence = 0;
function node(tag, text, cls) {
  const e = document.createElement(tag);
  if (text !== undefined) e.textContent = text;
  if (cls) e.className = cls;
  return e;
}
async function api(path, options = {
}) {
  let response;
  try {
    response = await fetch('/api/admin/' + path, {
      credentials: 'same-origin', ...options, headers: {
        'X-FCC-Admin': '1', ...options.headers
      }
    });
  } catch {
    $('signin').hidden = false;
    throw new Error('Could not reach the dashboard. Check your connection, or sign in again if your session expired.');
  }
  if (response.redirected || !response.headers.get('content-type')?.includes('application/json')) {
    $('signin').hidden = false;
    throw new Error('Your session needs refreshing. Sign in again.');
  }
  const data = await response.json();
  if (!response.ok) {
    if ([401,403].includes(response.status)) $('signin').hidden = false;
    throw new Error(data.error || 'The request could not be completed.');
  }
  return data;
}
const write = (path, method, data) => api(path, {
  method, headers: {
    'Content-Type': 'application/json'
  }, body: JSON.stringify(data)
});
function lock(value) {
  busy = value;
  $('fields').disabled = value;
  $('save').disabled = value;
  $('cancel').disabled = value;
}
function preview() {
  $('preview').hidden = !imageId;
  if (imageId) $('preview').src = '/api/admin/media/' + imageId + '/file';
  else $('preview').removeAttribute('src');
  field('image_alt').required = !!imageId;
}
function edit(item = null) {
  current = item;
  imageId = item?.image_id || null;
  form.reset();
  $('form-status').textContent = '';
  $('editor-title').textContent = (item ? 'Edit ' : 'Add ') + (kind === 'products' ? 'product' : 'gallery item');
  $('product-fields').hidden = kind !== 'products';
  field('category_id').disabled = kind !== 'products';
  $('order-field').hidden = kind !== 'gallery';
  field('name').value = item?.name || item?.title || '';
  field('description').value = item?.description || '';
  field('image_alt').value = item?.image_alt || '';
  field('published').checked = item?.published || false;
  if (kind === 'products') {
    if (item) field('category_id').value = item.category_id;
    field('featured').checked = item?.featured || false;
  }
  field('sort_order').value = item?.sort_order || 0;
  preview();
  if (kind === 'products') {
    field('brand').value = item?.brand || '';
    if (!item && parameters.get('category')) field('category_id').value = parameters.get('category');
    renderSpecifications(item?.specifications || {});
  }
  if (view !== 'product') $('editor').showModal();
  field('name').focus();
}
async function list() {
  const seq = ++sequence, requestedKind = kind;
  $('list-status').textContent = 'Loading…';
  $('items').replaceChildren();
  $('previous').disabled = $('next').disabled = true;
  try {
    const data = await api(kind + '?' + new URLSearchParams({
      page, limit: 12, q: $('search').value
    }));
    if (seq !== sequence) return;
    if (!data.items.length && page > 1) {
      page--;
      return list();
    }
    $('list-status').textContent = data.total ? `${data.total} ${kind === 'media' ? 'images' : 'items'}` : 'Nothing here yet. Add your first item to get started.';
    for (const item of data.items) {
      const card = node('article', undefined, 'card');
      if (item.image_id || kind === 'media') {
        const img = node('img');
        img.src = '/api/admin/media/' + (item.image_id || item.id) + '/file';
        img.alt = item.image_alt || '';
        img.loading = 'lazy';
        card.append(img);
      }
      card.append(node('h3', item.name || item.title || item.filename), node('p', kind === 'media' ? `${item.references_count} references · ${Math.ceil(item.size_bytes / 1024)} KB` : `${item.published ? 'Visible on website' : 'Hidden from website'}${item.featured ? ' · Featured' : ''}`));
      const actions = node('div', undefined, 'actions');
      if (kind !== 'media') {
        const button = node('button', 'Edit');
        button.onclick = () => kind === 'products' ? location.assign('/admin/product.html?id=' + item.id) : edit(item);
        actions.append(button);
      }
      const del = node('button', 'Delete', 'secondary');
      del.disabled = kind === 'media' && item.references_count > 0;
      del.onclick = async () => {
        if (!confirm(`Delete “${item.name || item.title || item.filename}”? This cannot be undone.`)) return;
        del.disabled = true;
        try {
          await write(requestedKind + '/' + item.id, 'DELETE', {
            version: item.version
          });
          $('notice').textContent = 'Deleted successfully.';
          await list();
        } catch (e) {
          $('notice').textContent = e.message;
          del.disabled = false;
        }
      };
      actions.append(del);
      card.append(actions);
      $('items').append(card);
    }
    $('page').textContent = `Page ${page} of ${Math.max(1, Math.ceil(data.total / 12))}`;
    $('previous').disabled = page === 1;
    $('next').disabled = page * 12 >= data.total;
  } catch (e) {
    if (seq === sequence) $('list-status').textContent = e.message + ' Use Refresh to try again.';
  }
}
if (view === 'product') lock(true);
$('cancel').onclick = () => view === 'product' ? location.assign('/admin/') : $('editor').close();
$('editor').addEventListener('cancel', e => {
  if (busy) e.preventDefault();
});
$('remove-image').onclick = () => {
  imageId = null;
  $('upload').value = '';
  preview();
};
$('upload').onchange = async () => {
  const file = $('upload').files[0];
  if (!file) return;
  lock(true);
  $('form-status').textContent = 'Optimizing and uploading image…';
  let bitmap;
  try {
    if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 20 * 1024 * 1024) throw new Error('Choose a JPEG, PNG or WebP image under 20 MB.');
    bitmap = await createImageBitmap(file);
    if (bitmap.width * bitmap.height > 80000000) throw new Error('This image is too large. Resize it before uploading.');
    const scale = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', .85));
    if (!blob || blob.size > 5 * 1024 * 1024) throw new Error('The optimized image is too large. Try a smaller image.');
    const data = await api('media', {
      method: 'POST', headers: {
        'Content-Type': blob.type, 'X-File-Name': 'website-image.' + (blob.type === 'image/webp' ? 'webp' : 'png')
      }, body: blob
    });
    imageId = data.item.id;
    preview();
    $('form-status').textContent = 'Image uploaded. Save the item to attach it.';
  } catch (e) {
    $('form-status').textContent = e.message;
  } finally {
    bitmap?.close();
    lock(false);
    $('upload').value = '';
  }
};
form.onsubmit = async e => {
  e.preventDefault();
  if (busy) return;
  if (kind === 'gallery' && !imageId) {
    $('form-status').textContent = 'Upload an image for this gallery item.';
    return;
  }
  const data = {
    description: field('description').value, image_id: imageId, image_alt: field('image_alt').value, published: field('published').checked, ...(current ? {
      version: current.version
    }
    : {
    })
  };
  if (kind === 'products') Object.assign(data, {
    brand: field('brand').value, specifications: Object.fromEntries([...document.querySelectorAll('[data-spec]')].map(input => [input.dataset.spec, input.value])),
    name: field('name').value, category_id: field('category_id').value, price_cents: current?.price_cents ?? null, price_unit: current?.price_unit ?? '', featured: field('featured').checked
  });
  else Object.assign(data, {
    title: field('name').value, sort_order: Number(field('sort_order').value)
  });
  lock(true);
  $('form-status').textContent = 'Saving…';
  try {
    await write(kind + (current ? '/' + current.id : ''), current ? 'PUT' : 'POST', data);
    if (view === 'product') { location.assign('/admin/?saved=1'); return; }
    $('editor').close();
    $('notice').textContent = data.published ? 'Saved and published on the website.' : 'Draft saved. It is not visible on the website.';
    await list();
  } catch (error) {
    $('form-status').textContent = error.message;
  } finally {
    lock(false);
  }
};
$('new').onclick = () => kind === 'products' ? location.assign('/admin/categories.html') : edit();
$('refresh').onclick = () => list();
$('previous').onclick = () => {
  page--;
  list();
};
$('next').onclick = () => {
  page++;
  list();
};
let timer;
$('search').oninput = () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    page = 1;
    list();
  }, 300);
};
(async () => {
  try {
    const session = await api('session');
    categories = (await api('categories')).items;
    $('identity').textContent = session.email;
    for (const c of categories) {
      const option = node('option', c.name);
      option.value = c.id;
      field('category_id').append(option);
    }
    document.querySelectorAll('nav button,#new,#refresh,#search').forEach(e => e.disabled = false);
    if (view === 'categories') {
      $('content-list').hidden = true;
      $('category-picker').hidden = false;
      for (const category of categories) {
        const link = node('a', category.name);
        link.href = '/admin/product.html?category=' + encodeURIComponent(category.id);
        $('category-choices').append(link);
      }
    } else if (view === 'product') {
      kind = 'products';
      $('content-list').hidden = true;
      const item = parameters.get('id') ? (await api('products/' + parameters.get('id'))).item : null;
      edit(item);
      lock(false);
    } else {
      $('new').hidden = kind === 'media';
      $('new').textContent = kind === 'gallery' ? 'Add gallery item' : 'Add product';
      $('section-title').textContent = kind === 'media' ? 'Images' : kind === 'gallery' ? 'Gallery' : 'Products';
      $('search').disabled = kind === 'media';
      if (parameters.has('saved')) $('notice').textContent = 'Product saved successfully.';
      await list();
    }
  } catch (e) {
    $('notice').textContent = e.message;
    $('signin').hidden = false;
  }
})();

function renderSpecifications(values = {}) {
  const category = categories.find(item => item.id === field('category_id').value);
  $('editor-title').textContent = (current ? 'Edit ' : 'Add ') + (category?.name || 'product');
  $('specification-fields').replaceChildren();
  for (const key of categoryFields[category?.slug] || []) {
    const label = node('label', labels[key]);
    const input = node('input');
    input.dataset.spec = key;
    input.maxLength = 180;
    input.value = values[key] || '';
    label.append(input);
    $('specification-fields').append(label);
  }
}
field('category_id').addEventListener('change', () => {
  const values = Object.fromEntries([...document.querySelectorAll('[data-spec]')].map(input => [input.dataset.spec, input.value]));
  renderSpecifications(values);
});
