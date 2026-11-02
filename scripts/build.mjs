import { rm, mkdir, cp } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
const run = (command, args) => { const r = spawnSync(command, args, { stdio: 'inherit' }); if (r.status !== 0) process.exit(r.status || 1); };
// CI hosts may run `npm run build` directly without installing the docs workspace.
if (!existsSync('docs/node_modules/.bin/vitepress')) run('npm', ['--prefix', 'docs', 'ci']);
run('node', ['scripts/generate-home.mjs']);
await rm('dist/site', { recursive: true, force: true });
await mkdir('dist/site', { recursive: true });
run('npm', ['--prefix', 'docs', 'run', 'build']);
await cp('home', 'dist/site', { recursive: true });
run('node', ['scripts/check.mjs']);
