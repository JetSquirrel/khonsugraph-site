import { readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
// One sitemap for the whole site, built from the canonical URL each page declares, so it follows whatever pages the build publishes.
const root = resolve('dist/site');
const origin = new URL(process.env.SITE_URL || 'https://khonsugraph.com').origin;
async function walk(dir) { const items = await readdir(dir, {withFileTypes:true}); return (await Promise.all(items.map(e => e.isDirectory() ? walk(resolve(dir,e.name)) : resolve(dir,e.name)))).flat(); }
const urls = new Map();
for (const file of (await walk(root)).filter(f => f.endsWith('.html'))) {
  const source = await readFile(file,'utf8');
  if (/<meta[^>]+name="robots"[^>]+noindex/.test(source)) continue;
  const canonical = source.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  // Language alternates as each page declares them, so search engines pair the English and Chinese versions.
  const alternates = [...source.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map(m => [m[1], m[2]]);
  if (canonical?.startsWith(origin + '/')) urls.set(canonical, alternates);
}
const escape = value => value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
await writeFile(resolve(root,'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${[...urls].sort(([a], [b]) => a < b ? -1 : 1).map(([u, alternates]) => `  <url><loc>${escape(u)}</loc>${alternates.map(([lang, href]) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${escape(href)}"/>`).join('')}</url>`).join('\n')}\n</urlset>\n`);
console.log(`Wrote sitemap.xml with ${urls.size} URLs.`);
