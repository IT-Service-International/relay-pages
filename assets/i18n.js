/* RELAY full-site localisation. English HTML is the independent fallback. */
(() => {
  'use strict';
  const script = document.currentScript;
  const base = new URL('locales/', script.src);
  const version = new URL(script.src).searchParams.get('v') || 'full1';
  const languages = new Set(['en', 'ru', 'de', 'nl', 'be', 'az', 'ar']);
  const sourceKeys = {"Reply email:":"tca363ca74c90","Clear screen":"ta76b40e38897","RELAY OPERATING ENVIRONMENT":"t7363ae716f1a","Type 'help' for available commands.":"t94886a8cd877","Contact information":"tcbc7311e953e","Command history":"tf5f0f8666332","Type 'help' to begin.":"ta3a3c34e8e93","Service:":"t65d157da69bf","Operator identity":"td1a871776e1f","Current directory":"taa248b8be4b6","Open technical notes":"t95e0fe52374f","RLY-01 / VIRTUAL UNIX SHELL":"tc6b25c71866e","Available commands":"tcb1c1917e7cd","Open tailored solutions":"t52dca0c00429","Environment":"t9e471951a1b4","Read file":"t47659c3dccc8","Language":"ta4fe65264ef7","Read message of the day":"t982986a6193b","Name:":"t2683cad48a14","Please contact me to clarify scope and next steps.":"t685299382f11","RELAY request /":"t27d81ff4115a","List files":"te700817c9d5e","List published notes":"tae1cb8618b4e","Your language preference is saved in this browser.":"t309e0902d954","Prepare a project request":"t67c1a285c1a9","Read published note":"t7e6309b0fc4e","Environment & desired outcome:":"tecf358a83f0f","Connecting to RELAY archive...":"t94c40f05ef93","Show RELAY version":"td52a5cc4c9c4","Connection lost. Mission continues.":"t7f524f2021b4","ASCII identity":"tde62f4cebd2d","Directory tree":"taeda2930caf9","Open manifesto.html":"t6b3a2e3b7dc9","To:":"t2b5fc5c94f64","Translation unavailable. Showing English.":"t1cd5f4ca1024","Detailed listing":"t3ddf860ab6d3","Local browser time":"tc06686f790b6","Draft ready. No email has been sent. You can edit the form and prepare it again.":"td5b16dc84939","Timing / budget context:":"t648533de9719","RELAY COMMAND REFERENCE":"tf5131b7d4a23","Not specified":"tdc12bec5d71f","Open engineering services":"t11c8d1a77de0","Loading translation…":"td05c63ab1814","Read live operator log":"taea49be794d7","Change directory":"tade2b704a98d","Search file text":"t356aeba594b7","Draft copied. Paste it into your email app and send it when ready.":"t46dfb52cd16a","Language preference cannot be saved in this browser.":"t96f433f0723b","Session uptime":"tbb830251171d","Organisation:":"t831bbab5313e","System status":"t25b128ae6598","Subject:":"t1edf47d5fb6c","Hello RELAY,":"t850e5cae9201","Copy is unavailable here. The draft is selected; use your device’s Copy command.":"td5bdcf372c81","Opening RELAY Technical Notes...":"ta3ae3ae22485","To discuss":"t49bf294d6776","Some text is shown in English because a translation is unavailable.":"t9cbda5995741"};
  const controls = document.querySelector('[data-language-controls]');
  if (!controls) return;
  const menu = controls.closest?.('[data-language-menu]');
  const summary = menu?.querySelector('summary');
  const buttons = [...controls.querySelectorAll('[data-language]')];
  const status = controls.querySelector('[data-language-status]');
  const entries = [...document.querySelectorAll('[data-i18n]')].map(node => ({node, key: node.dataset.i18n, english: node.textContent}));
  const attrs = [...document.querySelectorAll('[data-i18n-attrs]')].flatMap(node => {
    let mappings;
    try { mappings = JSON.parse(node.dataset.i18nAttrs); } catch (_) { return []; }
    return Object.entries(mappings).filter(([attr]) => ['alt','title','aria-label','placeholder','content'].includes(attr))
      .map(([attr,key]) => ({node,attr,key,english:node.getAttribute(attr)}));
  });
  const storageKey = 'relay.language.v1';
  const cache = new Map();
  let selected = 'en', messages = {}, requestNumber = 0, controller, canStore = true;
  const valid = key => Object.prototype.hasOwnProperty.call(messages,key) && typeof messages[key] === 'string' && messages[key].trim().length > 0;
  function text(english) {
    const core = english.trim();
    const key = sourceKeys[core];
    return selected !== 'en' && key && valid(key) ? english.match(/^\s*/)[0] + messages[key].trim() + english.match(/\s*$/)[0] : english;
  }
  // Terminal commands and data remain canonical. Only known UI/help prose is
  // translated; unknown strings (paths, logs, diagnostics) remain byte-faithful.
  function renderTerminal(node) {
    const original = node.dataset.i18nTerminal;
    node.replaceChildren();
    const lines = original.split('\n');
    lines.forEach((line,index) => {
      if (index) node.appendChild(document.createTextNode('\n'));
      const help = line.match(/^(\s*(?:help|services|tailored|request|pwd|ls|cd|tree|cat|grep|whoami|status|uname|neofetch|uptime|date|contact|manifesto|history|journal|notes|motd|version|clear)(?: [^ ]+)*?\s{2,})(.*)$/);
      const source = help ? help[2] : line;
      const translated = text(source);
      if (help) node.appendChild(document.createTextNode(help[1]));
      if (translated === source) { node.appendChild(document.createTextNode(source)); return; }
      const run = document.createElement('bdi'); run.dir = selected === 'ar' ? 'rtl' : 'ltr'; run.lang = selected;
      run.textContent = translated; node.appendChild(run);
    });
  }
  window.RELAYI18N = Object.freeze({
    text,
    terminal(node,original) { node.dataset.i18nTerminal = original; renderTerminal(node); },
    get language() { return selected; }
  });
  function setTranslatedText(node,value,lang) {
    // Keep paths, commands, URLs, versions and identifiers LTR inside Arabic prose.
    // Dictionary strings are still plain text; no HTML is parsed or trusted.
    if (lang !== 'ar' || ['TITLE','OPTION','TEXTAREA'].includes(node.tagName)) { node.textContent=value; return; }
    const technical = /https?:\/\/[^\s<>()]+|[€$]\s*\d+(?:[.,]\d+)*|(?:\/[A-Za-z0-9_.~-]+)+|\.?[A-Za-z0-9][A-Za-z0-9@.,_:+/#%~\\-]*(?:[ \u00a0]+[A-Za-z0-9][A-Za-z0-9@.,_:+/#%~\\-]*)*/g;
    node.replaceChildren(); let cursor=0;
    for (const match of value.matchAll(technical)) {
      node.appendChild(document.createTextNode(value.slice(cursor,match.index)));
      const token=document.createElement('bdi'); token.dir='ltr'; token.lang='en'; token.textContent=match[0];
      node.appendChild(token); cursor=match.index+match[0].length;
    }
    node.appendChild(document.createTextNode(value.slice(cursor)));
  }
  function show(lang,data={},failed=false) {
    selected = lang; messages = data;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    let missing = 0;
    for (const {node,key,english} of entries) {
      const translated = lang !== 'en' && valid(key);
      setTranslatedText(node,translated ? messages[key] : english,translated ? lang : 'en');
      const changed = translated && messages[key] !== english.trim();
      node.lang = changed ? lang : 'en';
      node.dir = changed && lang === 'ar' ? 'rtl' : 'ltr';
      if (lang !== 'en' && !translated) missing++;
    }
    for (const {node,attr,key,english} of attrs) {
      node.setAttribute(attr,lang !== 'en' && valid(key) ? messages[key] : english);
      if (lang !== 'en' && !valid(key)) missing++;
    }
    for (const node of document.querySelectorAll('[data-i18n-terminal]')) renderTerminal(node);
    for (const button of buttons) button.setAttribute('aria-pressed',String(button.dataset.language === lang));
    controls.setAttribute('aria-label',text('Language'));
    controls.removeAttribute('aria-busy');
    status.lang = lang; status.dir = lang === 'ar' ? 'rtl' : 'ltr';
    const label = lang === 'be' ? 'BY' : lang.toUpperCase();
    if (summary) {
      summary.textContent = label + ' ▾';
      summary.setAttribute('aria-label', text('Language') + ' · ' + label);
    }
    status.textContent = failed ? 'Translation unavailable. Showing English.' : '';
    if (missing) status.textContent += ' ' + text('Some text is shown in English because a translation is unavailable.');
    if (!canStore) status.textContent += ' ' + text('Language preference cannot be saved in this browser.');
    document.dispatchEvent(new CustomEvent('relay:languagechange',{detail:{language:lang}}));
  }
  async function select(lang,persist=false) {
    if (!languages.has(lang)) lang = 'en';
    const request = ++requestNumber;
    if (controller) controller.abort();
    if (persist) { try { localStorage.setItem(storageKey,lang); } catch (_) { canStore=false; } }
    if (lang === 'en') { show('en'); return; }
    if (cache.has(lang)) { show(lang,cache.get(lang)); return; }
    controls.setAttribute('aria-busy','true'); status.textContent = text('Loading translation…');
    let timeout;
    try {
      controller = new AbortController();
      const current = controller;
      timeout = setTimeout(() => current.abort(),8000);
      const response = await fetch(new URL(`${lang}.json?v=${encodeURIComponent(version)}`,base),{signal:current.signal,credentials:'same-origin'});
      if (!response.ok) throw new Error('Dictionary unavailable');
      const data = await response.json();
      if (data.locale !== lang || !data.messages || typeof data.messages !== 'object' || Array.isArray(data.messages)) throw new Error('Invalid dictionary');
      if (request !== requestNumber) return;
      cache.set(lang,data.messages); show(lang,data.messages);
    } catch (_) { if (request === requestNumber) show('en',{},true); }
    finally { clearTimeout(timeout); }
  }
  const browser = window.navigator;
  const browserLanguages = browser?.languages?.length ? browser.languages : [browser?.language];
  const browserPreference = browserLanguages
    .map(locale => locale?.toLowerCase().split('-')[0])
    .find(lang => languages.has(lang));
  let preference = browserPreference || 'en';
  try {
    const saved = localStorage.getItem(storageKey);
    if (languages.has(saved)) preference = saved;
  } catch (_) {
    canStore = false;
  }
  for (const button of buttons) button.addEventListener('click', () => {
    const selection = select(button.dataset.language, true);
    if (menu) {
      menu.open = false;
      summary.focus();
    }
    return selection;
  });
  if (menu) {
    menu.hidden = false;
    menu.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.open) {
        menu.open = false;
        summary.focus();
      }
    });
    document.addEventListener('click', event => {
      if (!menu.contains(event.target)) menu.open = false;
    });
  }
  controls.hidden=false;
  select(preference);
})();
