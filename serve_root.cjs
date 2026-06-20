const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8102;
const ROOT_DIR = 'C:/Users/白东鑫/work01/SoloCoder/6025-svgMap';

const mime = {
  '.html': 'text/html', '.js': 'application/javascript',
  '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png'
};

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  // Map /test-r2.html -> /demo/html/test-r2.html
  // Map /dist/* -> /dist/*
  // Map /data/* -> /demo/html/data/*
  // Map /demo.css -> /demo/html/demo.css
  // Map /local/* -> /demo/html/local/*

  if (urlPath === '/') urlPath = '/demo/html/test-r2.html';
  else if (urlPath === '/test-r2.html') urlPath = '/demo/html/test-r2.html';

  // For data, local, demo.css paths - resolve to demo/html
  if (urlPath.startsWith('/data/')) urlPath = '/demo/html' + urlPath;
  else if (urlPath.startsWith('/local/')) urlPath = '/demo/html' + urlPath;
  else if (urlPath === '/demo.css') urlPath = '/demo/html/demo.css';

  const fp = path.join(ROOT_DIR, urlPath);
  const ext = path.extname(fp);

  fs.readFile(fp, (e, d) => {
    if (e) {
      console.log('404:', req.url, '->', fp);
      res.writeHead(404);
      res.end('Not found: ' + req.url);
    } else {
      res.writeHead(200, { 'Content-Type': mime[ext] || 'text/html' });
      res.end(d);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('Server on http://0.0.0.0:' + PORT + ' root=' + ROOT_DIR);
  // Keep alive
  setInterval(() => {}, 60000);
});
