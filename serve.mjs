import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

const MIME = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'text/javascript',
  '.mjs':  'text/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
  '.ttf':  'font/ttf',
};

http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];

  // Try the requested file first
  const filePath = path.join(__dirname, urlPath);
  const ext = path.extname(filePath).toLowerCase();

  // If it has a known file extension, serve it directly
  if (ext && MIME[ext]) {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(200, { 'Content-Type': MIME[ext] });
        res.end(data);
      }
    });
  } else {
    // Try adding .html extension first (handles /blog/post-slug → blog/post-slug.html)
    const htmlPath = path.join(__dirname, urlPath + '.html');
    fs.readFile(htmlPath, (err, data) => {
      if (!err) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      } else {
        // SPA fallback — serve index.html for all other routes
        fs.readFile(path.join(__dirname, 'index.html'), (err2, data2) => {
          if (err2) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('500 Internal Server Error');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data2);
          }
        });
      }
    });
  }
}).listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
