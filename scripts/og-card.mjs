// Renders the 1200×630 link-preview card (home/assets/og-card.jpg) from the hero illustration.
// Needs rsvg-convert (brew install librsvg) and macOS sips. Run by hand after changing the artwork or the wording:
//   node scripts/og-card.mjs
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const data = file => readFile(file).then(b => `data:image/png;base64,${b.toString('base64')}`);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs><linearGradient id="shade" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#0d0f0c" stop-opacity=".94"/><stop offset=".42" stop-color="#0d0f0c" stop-opacity=".72"/><stop offset=".7" stop-color="#0d0f0c" stop-opacity="0"/></linearGradient></defs>
<rect width="1200" height="630" fill="#111411"/>
<image href="${await data('home/assets/hero-traces.png')}" x="0" y="-70" width="1200" height="800"/>
<rect width="1200" height="630" fill="url(#shade)"/>
<image href="${await data('home/assets/logo.png')}" x="72" y="68" width="52" height="52"/>
<g font-family="Helvetica Neue, Helvetica, Arial, sans-serif" fill="#f6f3e9">
<text x="140" y="105" font-size="32" font-weight="700" letter-spacing="-1">Khonsu<tspan font-weight="400">Graph</tspan></text>
<text x="72" y="300" font-size="92" font-weight="500" letter-spacing="-4">Built for</text>
<text x="72" y="400" font-size="92" font-weight="500" letter-spacing="-4" fill="#f1c56b">Hunters.</text>
<text x="72" y="474" font-size="30" fill="#d6d3c4">Open-source graph investigation workbench</text>
<text x="72" y="562" font-size="21" fill="#a8a996" letter-spacing=".5">Local-first  ·  Cypher + SQL  ·  macOS + Windows  ·  khonsugraph.com</text>
</g></svg>`;
const dir = await mkdtemp(join(tmpdir(), 'og-card-'));
await writeFile(join(dir, 'card.svg'), svg);
const r = spawnSync('rsvg-convert', ['-w', '1200', '-h', '630', '-o', join(dir, 'card.png'), join(dir, 'card.svg')], { stdio: 'inherit' });
const j = r.status === 0 ? spawnSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '86', join(dir, 'card.png'), '--out', 'home/assets/og-card.jpg'], { stdio: 'ignore' }) : r;
await rm(dir, { recursive: true, force: true });
if (j.status !== 0) process.exit(j.status || 1);
console.log('Wrote home/assets/og-card.jpg');
