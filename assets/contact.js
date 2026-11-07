/* RELAY request composer. No network requests and no browser storage. */
(() => {
  'use strict';
  const form = document.getElementById('request-form');
  if (!form) return;
  const draft = document.getElementById('request-draft');
  const text = document.getElementById('draft-text');
  const mail = document.getElementById('draft-mail');
  const status = document.getElementById('draft-status');
  const service = form.elements.namedItem('service');
  const requested = new URLSearchParams(window.location.search).get('service');
  if ([...service.options].some(option => option.value === requested)) service.value = requested;
  form.hidden = false;

  form.addEventListener('input', () => { draft.hidden = true; });
  form.addEventListener('submit', event => {
    event.preventDefault();
    for (const field of form.querySelectorAll('[required]')) {
      field.value = field.value.trim();
    }
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const get = key => String(data.get(key) || '').trim();
    const subject = 'RELAY request / ' + get('service');
    const body = [
      'Hello RELAY,', '',
      'Service: ' + get('service'),
      'Name: ' + get('name'),
      'Reply email: ' + get('email'),
      'Organisation: ' + (get('organisation') || 'Not specified'), '',
      'Environment & desired outcome:', get('details'), '',
      'Timing / budget context: ' + (get('timing') || 'To discuss'), '',
      'Please contact me to clarify scope and next steps.'
    ].join('\r\n');
    text.value = 'To: n0hup.relay@gmail.com\r\nSubject: ' + subject + '\r\n\r\n' + body;
    mail.href = 'mailto:n0hup.relay@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    status.textContent = 'Draft ready. No email has been sent. You can edit the form and prepare it again.';
    draft.hidden = false;
    text.focus();
  });
  document.getElementById('copy-draft').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(text.value);
      status.textContent = 'Draft copied. Paste it into your email app and send it when ready.';
    } catch {
      text.focus();
      text.select();
      status.textContent = 'Copy is unavailable here. The draft is selected; use your device’s Copy command.';
    }
  });
})();
