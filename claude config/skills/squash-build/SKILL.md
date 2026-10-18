---
name: squash-build
description: Squash the unpushed commits of the current repository into staged changes (no commit is made) and propose a numbered commit title ("#N: …", optionally "Build x.y.z") — use when the user asks to "gộp các commit chưa push", squash, or name a build commit.
---

# Squash unpushed commits and propose a `#N: …` title

This skill **squashes only**. It never runs `git commit` (no `-m`, `-F`, `--amend`) and never pushes: the user commits
and pushes themselves. The squashed work is left **staged**, and the skill ends by proposing a commit title.

## Project context (the only section to edit when reusing this skill in another repository)

- **The current repository**: `eqc-command-center`
- **Commit title format**: `#N: <title>`, or `#N: Build x.y.z` for a published build.
- **Remote and branch**: `origin/main`.
- **Task list used for bullets**: `docs/tasks/INDEX.md`.
- **Version files** (must all hold the same `x.y.z` for a `Build x.y.z` title): `internal/version/VERSION`;
  `build/config.yml` (`  version: "x.y.z"` under `info:`); `build/windows/info.json` (`file_version`,
  `ProductVersion`). Bumping is `wails3 task version:bump` / `wails3 task release`, never a build.
- **Report language to the user**: Vietnamese.

Steps below use these values.

1. **Inspect**
   ```bash
   git fetch -q; git status --short; git log --oneline origin/main..HEAD; git log --oneline -3 origin/main
   cat internal/version/VERSION   # path from Project context
   ```
   - Squash target = `origin/main` by default. If the user names a different range, the target is the commit just
     before the first commit they name (commits before it stay untouched), and the range must end at `HEAD`.
   - Uncommitted changes: ask whether they belong in the squash (version files from a build usually do).
   - Nothing ahead of the target: say so and stop.

2. **Number**: `N` = the number after the last `#N:` on **origin** (`git log origin/main --format=%s | grep -m1 -o '^#[0-9]*'`),
   plus one. If the user names a number, use it, unless it is already on origin: then say so and use the next free one.

3. **Version check** (only if the title will say `Build x.y.z`): every version file listed in Project context must hold
   `x.y.z` in the squashed tree. If they do not, say so — do not edit them by hand (bump with the command named in
   Project context, never with a build).

4. **Squash** (staged, not committed)
   ```bash
   OLD=$(git rev-parse HEAD)
   git reset --soft <target>      # origin/main by default
   ```
   If the user chose to include uncommitted changes, `git add` them now (staging is not committing).

5. **Prove nothing was lost**: `git diff --cached $OLD | wc -l` must be `0` (or list only the uncommitted changes the
   user chose to include); `git status -sb` shows the branch no longer ahead of the target by the squashed commits.

6. **Propose the title** — draft it from the squashed commits (`git log --format=%s $OLD ^<target>`) and the task list
   in Project context; do not commit it:
   ```
   #N: <short title>

   - <one bullet per task / fix>
   ```
   Offer a shorter alternative when the title is long.

7. **Report** (in the report language from Project context): the staged file count, "identical tree", the proposed
   title, that nothing was committed or pushed, and the recovery command `git reset --hard <OLD short hash>` (which
   also discards any uncommitted work, so say so).
