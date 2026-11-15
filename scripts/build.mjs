import { rm, mkdir, cp } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
// Resolve npm's JavaScript entry point so the build also works on Windows,
// where spawning the `npm` shim directly is not portable.
const npmCli = process.env.npm_execpath || resolve(dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js');
const run = (command, args) => {
  const viaNode = command === 'npm' && existsSync(npmCli);
  const r = viaNode
    ? spawnSync(process.execPath, [npmCli, ...args], { stdio: 'inherit' })
    : spawnSync(command, args, { stdio: 'inherit', shell: command === 'npm' });
  if (r.status !== 0) process.exit(r.status || 1);
};
// CI hosts may run `npm run build` directly without installing the docs workspace.
if (!existsSync('docs/node_modules/.bin/vitepress')) run('npm', ['--prefix', 'docs', 'ci']);
run('node', ['scripts/generate-home.mjs']);
await rm('dist/site', { recursive: true, force: true });
await mkdir('dist/site', { recursive: true });
run('npm', ['--prefix', 'docs', 'run', 'build']);
await cp('home', 'dist/site', { recursive: true });
run('node', ['scripts/sitemap.mjs']);
run('node', ['scripts/check.mjs']);
