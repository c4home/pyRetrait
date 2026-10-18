// Stop hook (task34.md > Q5): when a turn ends, type-check what changed.
//  - frontend .svelte / .ts changed  -> `npm run check` (in frontend/)
//  - .go changed                      -> `go vet` on internal/, services/ and the root package
//                                        (./build/ios is a known standalone-build false alarm)
// "Changed" = differs from HEAD (git status) AND differs from what this hook last checked
// (name + mtime fingerprint kept in .git/), so a docs-only turn, or a turn that did not touch
// those files again, costs nothing.
// On failure: exit 2 with the tail of the output on stderr, which Claude Code feeds back to
// the model. `stop_hook_active` (we already blocked once in this stop) -> never block again,
// so an error the model cannot fix cannot loop.
import { execSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const input = (() => {
  try {
    return JSON.parse(readFileSync(0, 'utf8') || '{}');
  } catch {
    return {};
  }
})();
if (input.stop_hook_active) process.exit(0);

const root = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
const stateFile = join(root, '.git', 'claude-stop-check.json');
const state = existsSync(stateFile) ? JSON.parse(readFileSync(stateFile, 'utf8')) : {};

const changed = execSync('git status --porcelain -uall', { cwd: root, encoding: 'utf8' })
  .split('\n')
  .filter(Boolean)
  .map((l) => l.slice(3).replace(/^"|"$/g, '').split(' -> ').pop());

function fingerprint(files) {
  return files
    .sort()
    .map((f) => {
      const p = join(root, f);
      return existsSync(p) ? `${f}:${statSync(p).mtimeMs}` : `${f}:deleted`;
    })
    .join('|');
}

const kinds = [
  {
    name: 'frontend',
    match: (f) => f.startsWith('frontend/src/') && /\.(svelte|ts)$/.test(f),
    cmd: 'npm run check',
    cwd: join(root, 'frontend'),
  },
  {
    name: 'go',
    match: (f) => f.endsWith('.go') && !f.startsWith('frontend/'),
    cmd: 'go vet ./internal/... ./services/... .',
    cwd: root,
  },
];

const failures = [];
for (const k of kinds) {
  const files = changed.filter(k.match);
  if (files.length === 0) continue;
  const fp = fingerprint(files);
  if (state[k.name] === fp) continue;
  const r = spawnSync(k.cmd, { cwd: k.cwd, shell: true, encoding: 'utf8' });
  const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
  if (r.status === 0) {
    state[k.name] = fp;
  } else {
    delete state[k.name];
    const tail = out.split('\n').filter((l) => l.trim() && !/npm (warn|notice)/.test(l)).slice(-30).join('\n');
    failures.push(`[stop-check] \`${k.cmd}\` failed after this turn's ${k.name} changes:\n${tail}`);
  }
}

writeFileSync(stateFile, JSON.stringify(state));
if (failures.length > 0) {
  process.stderr.write(failures.join('\n\n') + '\n');
  process.exit(2);
}
process.exit(0);
