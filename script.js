/* Optional progressive enhancement. No network requests or personal data storage. */
(() => {
  const form = document.getElementById('fcc-quote-form');
  const button = document.getElementById('fcc-prepare');
  const status = document.getElementById('fcc-status');
  if (!form || !button || !status) return;
  button.hidden = false;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const brief = ['FLOORING ENQUIRY — FIRST CHOICE CARPETS', 'Service area: Brampton, Ontario', '',
      `Name: ${data.get('name')}`, `Email: ${data.get('email')}`, `Interested in: ${data.get('material')}`,
      '', 'Project details:', data.get('details') || 'To be discussed', '',
      'This is a personal draft. It has NOT been sent to First Choice Carpets.'].join('\n');
    const url = URL.createObjectURL(new Blob([brief], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'first-choice-carpets-enquiry.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    status.textContent = 'Your enquiry file is ready to download. Nothing has been sent to First Choice Carpets.';
  });
})();
