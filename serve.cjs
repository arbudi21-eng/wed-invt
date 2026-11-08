const http = require('http'), fs = require('fs'), path = require('path');
const dir = process.argv[2] || 'C:\Users\yenro\Downloads\wedding-generator-v4\wedding-generator\sites';
const M = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.mp4': 'video/mp4', '.mp3': 'audio/mpeg', '.svg': 'image/svg+xml' };
http.createServer((q, r) => {
  let p = path.normalize(path.join(dir, decodeURIComponent(q.url.split('?')[0])));
  if (!p.startsWith(dir)) { r.writeHead(403); return r.end(); }
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
  fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); return r.end('Not found'); } r.writeHead(200, { 'Content-Type': M[path.extname(p)] || 'application/octet-stream' }); r.end(d); });
}).listen(3456, () => console.log('OK: Wedding Studio at http://localhost:3456'));