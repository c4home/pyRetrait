// Wails RPC mock for the Vite preview (generated from wails-mock.template.js by build-mock.mjs —
// edit the template, not the generated file). Load it in the page with ONE line:
//   const m = (await import('/.claude-mock/wails-mock.js')).default;
// then: m.install({ AllClients: [...], CreateClient: (input) => ({ client_id: 9, ...input }) })
//
// Handler forms, per method name (see IDS below):
//   value                      -> returned as the call's JSON result
//   (args) => value            -> computed from the call's arguments (array, in Go parameter order);
//                                 returning { fail: 'message' } makes that call reject
//   { fail: 'message' }        -> rejects like a Go error ('' = the empty-message case)
//   { delay: ms, ...rest }     -> waits, then applies the rest (value / fn / fail)
// Unmocked methods resolve to null. Every call is recorded in m.calls as { name, args }.
const IDS = /*__IDS__*/{};
const NAMES = Object.fromEntries(Object.entries(IDS).map(([n, id]) => [id, n]));

const json = (v, status = 200) =>
  new Response(JSON.stringify(v ?? null), { status, headers: { 'Content-Type': 'application/json' } });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const m = {
  IDS,
  calls: [],
  handlers: {},
  // Replace all handlers (and the call log). Patches window.fetch once.
  install(handlers = {}) {
    m.handlers = { ...handlers };
    m.calls = [];
    if (!window.__wailsMockOrigFetch) {
      window.__wailsMockOrigFetch = window.fetch;
      window.fetch = (url, opts) => (String(url).includes('/wails/runtime') ? m._answer(opts) : window.__wailsMockOrigFetch(url, opts));
    }
    return m;
  },
  // Add / change some handlers without touching the others.
  set(handlers) {
    Object.assign(m.handlers, handlers);
    return m;
  },
  count(name) {
    return m.calls.filter((c) => c.name === name).length;
  },
  async _answer(opts) {
    const body = JSON.parse(opts.body);
    const id = body.args.methodID;
    const args = body.args.args ?? [];
    const name = NAMES[id] ?? `#${id}`;
    m.calls.push({ name, args });
    let h = m.handlers[name];
    if (h && typeof h === 'object' && !Array.isArray(h) && 'delay' in h) {
      await sleep(h.delay);
      h = 'fail' in h ? { fail: h.fail } : 'fn' in h ? h.fn : h.value;
    }
    if (h && typeof h === 'object' && !Array.isArray(h) && 'fail' in h) return json({ message: h.fail }, 500);
    const v = typeof h === 'function' ? h(...args) : h;
    // A function handler may decide per call to fail: return { fail: 'message' }.
    if (v && typeof v === 'object' && !Array.isArray(v) && 'fail' in v) return json({ message: v.fail }, 500);
    return json(structuredClone(v ?? null));
  },

  // --- UI helpers (the preview pane is hidden: drive the DOM, then measure) ---
  sleep,
  // Neutralize CSS transitions so computed styles read the final value.
  noTransitions() {
    document.head.insertAdjacentHTML('beforeend', '<style>*{transition:none!important}</style>');
  },
  // Type into a field (drives bind:value), then blur (runs the onblur normalization).
  async fill(target, value, root = document) {
    const el = typeof target === 'string' ? root.querySelector(target) : target;
    el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    await sleep(40);
    el.dispatchEvent(new FocusEvent('blur'));
    await sleep(60);
    return el.value;
  },
  // First visible button whose text contains / matches `text`.
  button(text, root = document) {
    return [...root.querySelectorAll('button')].find(
      (b) => b.offsetParent !== null && (text instanceof RegExp ? text.test(b.textContent) : b.textContent.includes(text)),
    );
  },
  async click(text, root = document, wait = 120) {
    const b = typeof text === 'string' || text instanceof RegExp ? m.button(text, root) : text;
    if (!b) throw new Error(`no visible button matching ${text}`);
    b.click();
    await sleep(wait);
    return b;
  },
  // Topmost open <dialog> (modals nest in the DOM — scope queries to it).
  dialog() {
    return [...document.querySelectorAll('dialog')].filter((d) => d.open).at(-1) ?? null;
  },
  async go(hash, wait = 400) {
    location.hash = '/';
    await sleep(80);
    location.hash = hash;
    await sleep(wait);
  },
};

window.wailsMock = m;
export default m;
