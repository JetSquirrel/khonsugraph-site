import { rm, mkdir, cp } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
const run = (command, args) => { const r = spawnSync(command, args, { stdio: 'inherit' }); if (r.status !== 0) process.exit(r.status || 1); };
run('node', ['scripts/generate-home.mjs']);
await rm('dist/site', { recursive: true, force: true });
await mkdir('dist/site', { recursive: true });
run('npm', ['--prefix', 'docs', 'run', 'build']);
await cp('home', 'dist/site', { recursive: true });
run('node', ['scripts/check.mjs']);
