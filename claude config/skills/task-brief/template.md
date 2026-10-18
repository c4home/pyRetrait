# Task NN — <imperative subject>

> Goal: <what and why, 2–4 lines>. Context: <request, related tasks / specs>.
> Status: **WAITING FOR ANSWERS (section 2).**

## 0. What exists today

<Facts only, each with its file — measured or read, never guessed. One bullet per piece, never a table:>

- **<Piece>** — `path/to/file.ts` > `functionName`
  - Today: <what it does now>.
  - Why it matters: <the problem for this task>.

## 1. Decided (no question)

- <Everything that follows from the request, the specs or `docs/decisions.md`.>
- <If a standing rule changes, say which one and where it is written (spec / CLAUDE.md / decisions).>

## 2. Open questions (please answer)

### Q1 — <one decision, phrased as a question>
<The trade-off in 1–3 lines: what each choice costs / risks.>
- (a) <option>
- (b) <option>
- Recommendation: (a) — <why, one line>.

**Answer:**

### Q2 — …

**Answer:**

## 3. Plan

<One phase = one coherent, checkable step. In a phase, every file gets its own block — no tables:
a `####` heading with the file path, then **Action** (New / Edit / Delete / Move / Generate) and **Detail**.
A file that depends on an answer says so in its Action: "Edit (if Q2 = b)".>

### P1 — <subject>

#### `internal/db/writes_devis.go`
- **Action:** Edit
- **Detail:**
  - Add the `DevisEditInput` struct: `DevisObjet`, `DevisCout`, `Missions`, `Heures`.
  - Add `UpdateDevisFull(tx *sql.Tx, devisID int64, in DevisEditInput) error`: runs `UpdateDevis`, then
    `UpdateDevisMissions`, on the same transaction; returns the first error.

#### `frontend/src/lib/errors.ts`
- **Action:** New
- **Detail:**
  - Purpose: one place to turn a rejected binding call into visible text.
  - Exports `errorMessage(e: unknown): string` — `e.message` when non-empty, else `String(e)`, else
    `'Erreur inconnue.'`.

#### `services/old_service.go`
- **Action:** Delete
- **Detail:** no caller left after P2.

#### `frontend/bindings/`
- **Action:** Generate
- **Detail:** `wails3 generate bindings -ts -i` after the Go signature change (never hand-edited).

**Steps:** <commands or manual actions that are not a file change, if any>.
**Check:** `go test ./...` / `npm run check` / <specific test names>.

### Pn — Verification

- **<behaviour>**
  - How: <preview + mock (skill verify-frontend) / Go test / real app>
  - Expected: <measurable result>

### Pn — Docs

#### `docs/specs/ctx_feature_<x>.md`
- **Action:** Edit
- **Detail:** section "<name>" — <what changes>.

#### `docs/decisions.md`
- **Action:** Edit (only if a standing rule is introduced or changed)
- **Detail:** <the rule, why, source task>.

#### `docs/tasks/INDEX.md`
- **Action:** Edit
- **Detail:** Open line for this task (moved to Archive on close).

## 4. Out of scope

- <What is deliberately not done, so nobody adds it "while at it".>
