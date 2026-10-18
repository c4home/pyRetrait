---
name: readme-update
description: Update README.md of the current repository after a feature, version command, or .claude component (skill, agent, hook, setting) was added, changed or removed - keeps the word limits and the no-table format. Use ONLY when the user explicitly asks to update / refresh the README (typically once features are finished); never trigger it on your own at the end of a task.
---

# Update README.md

## Project context (the only section to edit when reusing this skill in another repository)

- **The current repository**: `eqc-command-center`
- **README language**: English.
- **Sections** (touch only the ones the change affects):
  1. Overview - what the software is.
  2. Features - one entry per routed feature, as `**Name** (*French screen name*): ...`.
  3. Version commands - `wails3 task version`, `version:bump`, `release`.
  4. The `.claude` directory - an overview, then one subsection per component.
- **Sources of truth**:
  - Features: the table in `docs/specs/ctx_contextGeneral.md` and the feature's `docs/specs/ctx_feature_*.md`.
  - Version commands: root `Taskfile.yml` and the Build version section of `CLAUDE.md`.
  - `.claude` components: the files themselves.
- **Related file to keep in sync**: the "Where to read what" table in `CLAUDE.md` (new skills and agents).
- **Report language to the user**: Vietnamese.

Everything below uses these values.

## Limits and format (hard rules)

- **Large description** = a section overview (section 1, the intro of section 4): at most **100 words**.
- **Small description** = one feature, one version command, one `.claude` component: at most **50 words**. Count the description text only - not the heading or bold name, not code blocks.
- **No tables, anywhere.** Use headings, bullet lists and fenced code blocks only.
- Keep the existing shape of each section (see Project context); version commands and `.claude` components are `###` subsections; usage examples are fenced `bash`-style blocks.
- Plain statements of what it is or does. No marketing words, no "easy", "powerful", no history ("recently added").

## Sources of truth - never describe from memory

- Use the sources listed in Project context.
- For `.claude` components read the files themselves: frontmatter `description` of agents and skills, `settings.json`, `launch.json`, the head comment of hooks and scripts. List every file that exists, in directory order; delete the subsection of a removed one.
- When a spec and the code disagree, say so to the user instead of choosing silently.

## Steps

1. Read README.md and the source of truth for what changed.
2. Edit only the affected entries; add a new feature / component in the same position as its siblings.
3. **Count the words** of every description you wrote or changed (a section overview <= 100, an entry <= 50) and trim until it fits. Do not estimate. To count one paragraph:
   ```bash
   echo "paste the description text" | wc -w
   ```
4. Check: no `|---` table row in the file (`grep -n '^|' README.md` must print nothing); every file under `.claude/` is covered by a subsection of section 4; the `.claude` overview still agrees with the component list (counts, names).
5. If the change also touches the related file named in Project context (a new skill or agent), update it in the same pass.
6. Report to the user in the report language from Project context: which entries changed, and the word count of each.
