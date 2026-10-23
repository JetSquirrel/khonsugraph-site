import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve(process.argv[2] || 'home');
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.txt': 'text/plain; charset=utf-8', '.md': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.woff2': 'font/woff2' };
http.createServer(async (req, res) => {
  try {
    const path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (path !== root && !path.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    let file;
    for (const candidate of [path, path + '.html', resolve(path, 'index.html')]) {
      if (await stat(candidate).then(s => s.isFile()).catch(() => false)) { file = candidate; break; }
    }
    res.writeHead(file ? 200 : 404, { 'Content-Type': types[extname(file || '.html')] || 'application/octet-stream' });
    res.end(await readFile(file || resolve(root, '404.html')));
  } catch { res.writeHead(400).end('Bad request'); }
}).listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}`));
