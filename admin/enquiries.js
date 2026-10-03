(() => {
  const list = document.getElementById('enquiries');
  const notice = document.getElementById('notice');
  let page = 1;
  async function api(path, method = 'GET', body) {
    const response = await fetch('/api/admin/enquiries' + path, {
      method, credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-FCC-Admin': '1' },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    if (response.redirected || !response.headers.get('content-type')?.includes('application/json')) throw new Error('Your session expired. Return to the dashboard to sign in again.');
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Unable to load enquiries.');
    return data;
  }
  function element(tag, text, parent) {
    const node = document.createElement(tag);
    node.textContent = text;
    parent.appendChild(node);
    return node;
  }
  async function change(button, action) {
    button.disabled = true;
    try { await action(); await load(); }
    catch (error) { notice.textContent = error.message; button.disabled = false; }
  }
  async function load() {
    notice.textContent = 'Loading…';
    try {
      const data = await api('?page=' + page);
      list.replaceChildren();
      for (const item of data.items) {
        const card = element('article', '', list);
        element('h3', item.name, card);
        element('p', new Date(item.created_at).toLocaleString() + ' · ' + item.material, card);
        const email = element('a', item.email, card);
        email.href = 'mailto:' + encodeURIComponent(item.email);
        if (item.phone) element('p', 'Phone: ' + item.phone, card);
        element('p', item.details, card).className = 'enquiry-message';
        const label = element('label', 'Status', card);
        const select = element('select', '', label);
        for (const value of ['New', 'Contacted', 'Closed']) {
          const option = element('option', value, select);
          option.value = value;
        }
        select.value = item.status;
        select.addEventListener('change', () => change(select, () => api('/' + item.id, 'PUT', { status: select.value })));
        element('p', item.notification_status === 'sent' ? 'Email notification accepted by the email service.' : 'Email notification: ' + item.notification_status, card);
        if (item.notification_status !== 'sent') {
          const retry = element('button', 'Retry email notification', card);
          retry.addEventListener('click', () => change(retry, () => api('/' + item.id + '/retry', 'POST')));
        }
      }
      notice.textContent = data.total ? data.total + ' enquiries' : 'No enquiries yet.';
      document.getElementById('page').textContent = 'Page ' + page;
      document.getElementById('previous').disabled = page <= 1;
      document.getElementById('next').disabled = page * 20 >= data.total;
    } catch (error) { notice.textContent = error.message; }
  }
  document.getElementById('refresh').onclick = load;
  document.getElementById('previous').onclick = () => { page--; load(); };
  document.getElementById('next').onclick = () => { page++; load(); };
  load();
})();
