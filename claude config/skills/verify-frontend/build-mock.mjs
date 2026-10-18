// Generates frontend/.claude-mock/wails-mock.js: the Wails RPC mock for the browser preview,
// with the CURRENT method-ID table read from frontend/bindings/ (IDs change whenever a Go
// signature changes, so never hard-code them). Run from anywhere in the repo:
//   node .claude/skills/verify-frontend/build-mock.mjs
// The output folder is git-ignored and is NOT part of the app build (not in public/, never
// imported by the app) — Vite only serves it to the preview on demand.
import { execSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const root = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
const bindings = join(root, 'frontend', 'bindings', 'changeme');

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : e.name.endsWith('.ts') ? [join(dir, e.name)] : [],
  );
}

// export function Name(...): ... {\n    return $Call.ByID(123, ...
const RE = /export function (\w+)\([^)]*\)[^{]*\{\s*return \$Call\.ByID\((\d+)/g;
const ids = {};
const services = {};
for (const file of walk(bindings)) {
  const service = basename(file, '.ts');
  for (const m of readFileSync(file, 'utf8').matchAll(RE)) {
    const [, name, id] = m;
    if (ids[name] !== undefined && ids[name] !== Number(id)) {
      // Same method name in two services: keep both qualified, drop the ambiguous short name.
      services[`${services[name]}.${name}`] = ids[name];
      ids[`${services[name]}.${name}`] = ids[name];
      delete ids[name];
      ids[`${service}.${name}`] = Number(id);
      continue;
    }
    ids[name] = Number(id);
    services[name] = service;
  }
}

const template = readFileSync(join(root, '.claude', 'skills', 'verify-frontend', 'wails-mock.template.js'), 'utf8');
const outDir = join(root, 'frontend', '.claude-mock');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'wails-mock.js'), template.replace('/*__IDS__*/{}', JSON.stringify(ids, null, 2)));
console.log(`wails-mock.js written: ${Object.keys(ids).length} methods -> ${outDir}`);
