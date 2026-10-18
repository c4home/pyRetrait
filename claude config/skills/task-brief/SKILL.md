---
name: task-brief
description: Write, run and close a task brief (a numbered spec file for one change) for the current repository — use when the user asks for a task / brief / "viết taskNN" / "tạo task", when they say "read again, start if no question", and when a task's work is finished.
---

# Task briefs

## Project context (the only section to edit when reusing this skill in another repository)

- **The current repository**: `eqc-command-center`
- **Briefs**: `docs/tasks/taskNN.md` (open), `docs/tasks/archive/` (done); `docs/tasks/INDEX.md` has one line per
  task (an Open table and an Archive table). Sub-tasks: `task28-a`.
- **Never rename a brief**: source comments cite `taskNN.md` by name.
- **Brief language**: English, even for quoted French schema or comments; UI strings the feature shows stay French.
- **Report language to the user**: Vietnamese.
- **Always read when researching**: `CLAUDE.md`, `docs/specs/` (start with `ctx_contextGeneral.md`),
  `docs/decisions.md`, plus `frontend/CLAUDE.md` / `internal/CLAUDE.md` for the side touched.
- **Docs phase files**: specs in `docs/specs/`, `docs/decisions.md`, the `CLAUDE.md` files, `docs/tasks/INDEX.md`.
- **Check commands** for `Check:` lines: `go test ./...`, `go vet ./...`, `npm run check` (from `frontend/`), named
  tests. Frontend behaviour is verified with the `verify-frontend` skill.
- **Agents**: `task-planner` (Opus) writes and revises briefs; `task-implementer` (Sonnet) implements code phases.
  The main session runs on Sonnet.

## 1. Writing a brief

**Delegate the writing to the `task-planner` agent** (see Project context for the model split). Give it the full
request in the prompt (goal, constraints, anything the user said, related tasks / specs): it starts cold and cannot
ask anyone. It follows the steps below, writes the brief file, adds the index line and reports the questions.
Review the brief it wrote (self-check below), then do step 5 yourself. Write the brief inline only for a trivial
one. To revise after the user's answers change the design, call `task-planner` again with the brief path and what
changed.

1. **Number**: highest task number in the open + archive briefs folders + 1 (sub-task naming: see Project context).
2. **Research first**: read the "Always read when researching" files from Project context and the code involved. Section 0 states
   facts with file references — no guesses. Anything already decided goes to section 1, not into a question.
3. **Write it from [template.md](template.md)** (read it each time). Hard rules:

   **No tables, anywhere in a brief** — not in section 0, not in questions, not in the plan, not in verification.
   Present information as headings, bullet lists and file blocks only. (Markdown tables wrap badly in the editor
   and hide long cells; a list keeps every fact readable.)

   **Questions (section 2)**
   - One decision per question, phrased as a question, with the trade-off in 1–3 lines.
   - Options as (a) / (b) / (c); always a `Recommendation: (x) — <why>`.
   - **Every question ends with its own `**Answer:**` line**, left empty for the user.

   **Plan (section 3)**
   - Phases (P1…Pn), each coherent and checkable, each ending with a `Check:` line (the check commands from Project
     context, named tests).
   - **Every file touched by a phase gets its own block — never a table**:
     ```markdown
     #### `path/to/file`
     - **Action:** Edit            (New / Edit / Delete / Move / Generate; "Edit (if Q2 = b)" when answer-dependent)
     - **Detail:**
       - <what changes / what it contains, one bullet per change>
     ```
     - **Edit** → the existing path; Detail = what changes in it (functions, sections, props, behaviour), specific
       enough that a reviewer knows what the diff will contain.
     - **New** → the full path of the file to create; Detail = its purpose and contents (main exports / props /
       sections).
     - **Delete / Move / Generate** → path(s); Detail = why / the command.
   - Commands or manual steps that are not file changes go on a `**Steps:**` line after the blocks.
   - Always end with a **Verification** phase (behaviour → how → expected, measurable) and a **Docs** phase (the "Docs phase files"
     from Project context), the Docs phase using the same file blocks.

4. **Self-check before reporting**: every question has a Recommendation and an empty `**Answer:**`; the brief contains
   no table at all; every phase lists each file as a block with path, Action and Detail; every Edit says *what* changes, every New has a
   full path and its contents; nothing in "Decided" is also asked.
5. Add the line to the briefs index (Open table; already done when `task-planner` wrote the brief). Report to
   the user **in the report language from Project context**: a short list of the questions with the recommendation (no table), and the 1–2
   questions that matter most.

## 2. "Read again, start if no question"

- Re-read the brief (the user edits it on disk). `Recommendation` / `follow Recommendation` = take the recommended
  option. An ambiguous or contradictory answer: ask only if it changes what gets built; otherwise take the reading
  closest to the recommendation and **write that reading into the brief** next to the answer.
- If an answer raises a new question, add it under "2b. Follow-up questions" (same format) and stop; otherwise update
  the file blocks to the chosen options and start with P1. When the answers change the design substantially (not just
  picking an option), hand the revision to `task-planner` instead of rewriting the plan yourself.
- Code phases are delegated to the **task-implementer** agent (brief path + phases, e.g. "P1–P2"): it follows the
  file blocks, runs each `Check:`, and reports files, deviations, check output and open points. Review its diff, then
  do Verification and Docs in the main session. Do the work inline instead when the phase is tiny.

## 3. Closing a brief

- Status → `**DONE (P1–Pn).**` + one line summarising the answers.
- Add a **Result** paragraph under the Verification phase: what was checked and how (numbers), what was NOT checked,
  bugs found on the way, and any file changed that was not in the plan (and why).
- Move the brief to the archive folder, move its index line to the Archive table, fix links pointing to it.
- Record any standing rule it introduced in the decisions file and the spec (Docs phase files in Project context).
