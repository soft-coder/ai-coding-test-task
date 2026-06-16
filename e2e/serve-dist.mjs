// Minimal static file server for e2e/visual runs.
//
// We deliberately avoid `ng serve` here: this repo lives on a VirtualBox shared
// folder where the dev-server file watcher fails (`EISDIR ... watch`). Playwright
// only needs the built app served statically, so `npm run e2e` builds first and
// this server serves `dist/.../browser` with SPA fallback — no watcher involved.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const root = join(process.cwd(), 'dist', 'categories-reference', 'browser');
const port = Number(process.env['E2E_PORT'] ?? 4200);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent((req.url ?? '/').split('?')[0]);
    let filePath = join(root, urlPath);
    // SPA fallback: route paths (no file extension) and missing files → index.html
    if (urlPath === '/' || !extname(filePath) || !existsSync(filePath)) {
      filePath = join(root, 'index.html');
    }
    const body = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}).listen(port, () => console.log(`e2e static server on http://localhost:${port}`));
