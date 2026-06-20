const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8101;
const HTML_DIR = 'C:/Users/白东鑫/work01/SoloCoder/6025-svgMap/demo/html';

const mime = {
  '.html': 'text/html', '.js': 'application/javascript',
  '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png'
};

const server = http.createServer((req, res) => {
  let fp = path.join(HTML_DIR, req.url === '/' ? 'test-r2.html' : req.url);
  const ext = path.extname(fp);
  fs.readFile(fp, (e, d) => {
    if (e) {
      res.writeHead(404);
      res.end('Not found: ' + req.url);
    } else {
      res.writeHead(200, { 'Content-Type': mime[ext] || 'text/html' });
      res.end(d);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('Server running on http://0.0.0.0:' + PORT);
  // Keep process alive
  setInterval(() => {}, 60000);
});
