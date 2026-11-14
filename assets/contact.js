/* RELAY request composer. No network requests and no browser storage. */
(() => {
  'use strict';
  const t = value => window.RELAYI18N ? window.RELAYI18N.text(value) : value;
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
  document.addEventListener('relay:languagechange', () => { draft.hidden = true; status.textContent = ''; });

  form.addEventListener('input', () => { draft.hidden = true; });
  form.addEventListener('submit', event => {
    event.preventDefault();
    for (const field of form.querySelectorAll('[required]')) {
      field.value = field.value.trim();
    }
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const get = key => String(data.get(key) || '').trim();
    const subject = t('RELAY request / ') + (service.selectedOptions[0]?.textContent || get('service'));
    const body = [
      t('Hello RELAY,'), '',
      t('Service: ') + (service.selectedOptions[0]?.textContent || get('service')),
      t('Name: ') + get('name'),
      t('Reply email: ') + get('email'),
      t('Organisation: ') + (get('organisation') || t('Not specified')), '',
      t('Environment & desired outcome:'), get('details'), '',
      t('Timing / budget context: ') + (get('timing') || t('To discuss')), '',
      t('Please contact me to clarify scope and next steps.')
    ].join('\r\n');
    text.value = t('To:') + ' engage@n0hup.nl\r\n' + t('Subject:') + ' ' + subject + '\r\n\r\n' + body;
    mail.href = 'mailto:engage@n0hup.nl?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    status.textContent = t('Draft ready. No email has been sent. You can edit the form and prepare it again.');
    draft.hidden = false;
    text.focus();
  });
  document.getElementById('copy-draft').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(text.value);
      status.textContent = t('Draft copied. Paste it into your email app and send it when ready.');
    } catch {
      text.focus();
      text.select();
      status.textContent = t('Copy is unavailable here. The draft is selected; use your device’s Copy command.');
    }
  });
})();
