import { readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
// One sitemap for the whole site, built from the canonical URL each page declares, so it follows whatever pages the build publishes.
const root = resolve('dist/site');
const origin = new URL(process.env.SITE_URL || 'https://khonsugraph.com').origin;
async function walk(dir) { const items = await readdir(dir, {withFileTypes:true}); return (await Promise.all(items.map(e => e.isDirectory() ? walk(resolve(dir,e.name)) : resolve(dir,e.name)))).flat(); }
const urls = new Set();
for (const file of (await walk(root)).filter(f => f.endsWith('.html'))) {
  const source = await readFile(file,'utf8');
  if (/<meta[^>]+name="robots"[^>]+noindex/.test(source)) continue;
  const canonical = source.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (canonical?.startsWith(origin + '/')) urls.add(canonical);
}
const escape = value => value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
await writeFile(resolve(root,'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...urls].sort().map(u => `  <url><loc>${escape(u)}</loc></url>`).join('\n')}\n</urlset>\n`);
console.log(`Wrote sitemap.xml with ${urls.size} URLs.`);
