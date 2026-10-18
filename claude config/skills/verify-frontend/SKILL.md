---
name: verify-frontend
description: Verify a frontend (Svelte) change of eqc-command-center in the browser preview with mocked Wails calls — load before any preview check, layout measurement, or "does this screen work" verification.
---

# Verify a frontend change in the preview

The preview is plain Vite (`frontend-dev` in `.claude/launch.json`, port **9245**, fixed — kill a stale `node`
holding it rather than switching ports). It has no Wails runtime: every service call is `POST /wails/runtime`, which
404s unless mocked. So the preview proves rendering, types, client-side logic and — with the mock below — UI flows
against fake data; it never proves real data flow (that needs `wails3 dev` or a built `.exe`; say so when reporting).

`npm run check` first (the Stop hook also runs it when `.svelte`/`.ts` changed).

## 1. Generate the mock (once per session, and after any Go signature change)

```bash
node .claude/skills/verify-frontend/build-mock.mjs
```

It reads the current method IDs from `frontend/bindings/` and writes `frontend/.claude-mock/wails-mock.js`
(git-ignored, never part of the app build). Never hard-code method IDs: they change with Go signatures.

## 2. Load it in the page — one line, then drive the UI

```js
const m = (await import('/.claude-mock/wails-mock.js')).default;
m.noTransitions();                         // always, before reading any style (see traps)
m.install({
  AllClients: [{ client_id: 1, client_nom: 'DUPONT', client_alias: 'DUPONT', client_type: 'Entreprise', code_type: 'SIREN', client_code: '' }],
  CreateClient: (input) => ({ client_id: 9, ...input }),   // computed from the call's args
  CreateDevis: { delay: 400, value: { devisId: 7, devisCode: 'D26-001' } },
  UpdateDevisFull: { fail: '' },           // rejection; '' reproduces the empty-message case
});
await m.go('/client-maker');               // hash route, re-mounts the screen
await m.fill('[id$="-nom"]', ' dupont  sa. ');   // input + blur, returns the normalized value
await m.click('Créer client');
m.count('CreateClient'); m.calls;          // assertions: [{ name, args }]
m.set({ CreateClient: { delay: 300, fn: (i) => ({ client_id: 10, ...i }) } });  // change some handlers
m.dialog();                                // topmost open <dialog>, scope queries to it
```

Unmocked methods resolve to `null`. Method names are the Go method names (`AllClients`, `ProjetDetail`,
`ExportDocx`…); a name present in two services is qualified (`dataservice.Name`) — see `m.IDS`.
Data shapes: `frontend/bindings/changeme/internal/db/models.ts`.

Standard checks for a write button: success path; `{ fail: '' }` shows a visible banner; `{ delay }` + double click
→ `m.count(name) === 1` and the button disabled meanwhile.

## 3. Measure, don't eyeball

Screenshots usually fail (`the Browser pane is not displayed`) — measurement is the proof, plan for it.

- **Resize to the real window first**: `resize_window` 1200×960 (`main.go`), and 1150 wide (`MinWidth`) for
  overflow checks; reset with preset `desktop` at the end. Judge colours in **light** mode (see memory no-dark-mode).
- "fixed height, scrolls inside" = the zone's rect is identical empty and full, and the inner list has
  `scrollHeight > clientHeight` with `overflow-y: auto`.
- "text wraps" = `scrollWidth <= clientWidth` on the element, and `documentElement.scrollWidth <= innerWidth`.
- "this colour paints" = read `getComputedStyle(el).backgroundColor`, not the class list (DaisyUI can set a variable
  while the element stays transparent).
- `read_console_messages` before declaring done; the 404 of `GetVersion` before the mock is installed is expected.

## Traps (each one has cost a wrong conclusion before)

- **The pane is hidden, so animations never advance**: CSS transitions sit at `currentTime: 0` and Svelte `in:`
  transitions stay at their first frame (opacity 0). `m.noTransitions()` covers CSS; for Svelte transitions check the
  end state / that `getAnimations().length` > 0, and check the motion itself only in `wails3 dev`.
- **Nested modals nest their `<dialog>` in the DOM** — scope with `m.dialog()` / `b.closest('dialog') === d`, or a
  selector bug looks like a save bug.
- **Money**: `Intl` emits U+202F / U+00A0; normalise whitespace before comparing strings like `12 800,00`.
- **The console buffer survives reloads** (stale HMR errors) — open a fresh tab to prove the current build is clean.
- **`location.reload()` inside a script cuts the script off** — reload in one call, install the mock in the next
  (the mock does not survive a reload; reinstall after one).
- A `Combobox` loads its list on first open: focus/click its input, wait ~300 ms, then click the card.
- `preview_stop` does not always free 9245 — check the port and kill the stale `vite` child.

## Go test fixtures

Same mindset for Go fixtures (e.g. `seedFixture` in `internal/db/reads_test.go`): they are data, not decoration. If
a field can't be told apart from its neighbour, change the fixture so a mis-wiring would be visible, and say so.
