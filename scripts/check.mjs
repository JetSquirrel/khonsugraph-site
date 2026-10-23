import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
const root = resolve('dist/site');
async function walk(dir) { const items = await readdir(dir, {withFileTypes:true}); return (await Promise.all(items.map(e => e.isDirectory() ? walk(resolve(dir,e.name)) : resolve(dir,e.name)))).flat(); }
const files = await walk(root), html = files.filter(f => f.endsWith('.html'));
const errors = [];
for (const file of html) {
  const source = await readFile(file,'utf8');
  const base = new URL('/' + relative(root,file), 'https://site.test');
  if (!/<html[^>]+lang=/.test(source)) errors.push(`${file}: missing language`);
  if (!/<title>[^<]+<\/title>/.test(source)) errors.push(`${file}: missing title`);
  for (const match of source.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const value = match[1].replaceAll('&amp;','&');
    if (/^(https?:|mailto:|data:|tel:|javascript:|\/\/)/.test(value)) continue;
    const url = new URL(value,base), pathname = decodeURIComponent(url.pathname);
    const path = resolve(root,'.' + pathname);
    let target;
    for (const candidate of [path,path+'.html',resolve(path,'index.html')]) {
      if (await stat(candidate).then(s=>s.isFile()).catch(()=>false)) {target=candidate;break;}
    }
    if (!target) errors.push(`${relative(root,file)}: missing ${value}`);
    else if (url.hash && target.endsWith('.html')) {
      const content = target===file?source:await readFile(target,'utf8');
      const id = decodeURIComponent(url.hash.slice(1));
      if (!content.includes(`id="${id}"`)) errors.push(`${relative(root,file)}: missing anchor ${value}`);
    }
  }
  for (const match of source.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(match[1]); } catch { errors.push(`${file}: invalid structured data`); }
  }
}
for (const file of ['index.html','zh/index.html']) {
  const source = await readFile(resolve(root,file),'utf8');
  for (const [tag] of source.matchAll(/<(?:script|link|img)\b[^>]*>/g)) {
    const isResource = !tag.startsWith('<link') || /rel="(?:stylesheet|preload|modulepreload|prefetch)"/.test(tag);
    if (isResource && /(?:src|href)="https?:\/\//.test(tag)) errors.push(`${file}: external asset request`);
  }
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`Checked ${html.length} HTML pages: internal links, fragments, assets, metadata and structured data passed.`);
