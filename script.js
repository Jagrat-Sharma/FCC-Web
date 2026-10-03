(() => {
  const form = document.getElementById('fcc-quote-form');
  if (!form) return;
  const button = document.getElementById('fcc-prepare');
  const status = document.getElementById('fcc-status');
  let token = '', widget, sending = false, paused = false, reference = crypto.randomUUID();
  const update = () => { button.disabled = sending || paused || !token; };
  async function initialize() {
    try {
      const response = await fetch('/api/contact/config');
      if (!response.ok) throw new Error();
      const config = await response.json();
      if (config.paused) { paused = true; status.textContent = config.message; update(); return; }
      if (!config.enabled) throw new Error();
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.onerror = () => { status.textContent = 'The spam check could not load. Please refresh, call or email us.'; };
      script.onload = () => {
        widget = window.turnstile.render('#fcc-spam-check', {
          sitekey: config.sitekey, action: 'contact', size: 'flexible',
          callback: value => { token = value; update(); },
          'expired-callback': () => { token = ''; update(); },
          'error-callback': () => { token = ''; update(); status.textContent = 'Please retry the spam check or contact us by phone or email.'; }
        });
        status.textContent = '';
      };
      document.head.appendChild(script);
    } catch {
      status.textContent = 'Online enquiries are currently unavailable. Please call or email us using the details on this page.';
    }
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || !token || !form.reportValidity()) return;
    sending = true;
    update();
    button.textContent = 'Sending…';
    status.textContent = '';
    try {
      const response = await fetch('/api/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...Object.fromEntries(new FormData(form)), id: reference, token })
      });
      const result = await response.json();
      if (result.paused) paused = true;
      if (!response.ok) throw new Error(result.error || 'Unable to send. Please try again.');
      form.reset();
      reference = crypto.randomUUID();
      status.textContent = 'Thank you! Your enquiry has been saved for our team. We will contact you using the details you provided.';
    } catch (error) {
      status.textContent = error.message === 'Failed to fetch' ? 'Connection interrupted. Please try again or call us.' : error.message;
    } finally {
      sending = false;
      token = '';
      button.textContent = 'Send enquiry';
      update();
      if (widget !== undefined && !paused) window.turnstile.reset(widget);
    }
  });
  initialize();
})();
