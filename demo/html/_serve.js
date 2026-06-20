const http = require('http'), fs = require('fs'), path = require('path');
const mime = {'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png'};
http.createServer((req,res)=>{
  let fp = path.join(__dirname, req.url==='/'?'test-r2.html':req.url);
  const ext = path.extname(fp);
  fs.readFile(fp,(e,d)=>{if(e){res.writeHead(404);res.end('Not found')}else{res.writeHead(200,{'Content-Type':mime[ext]||'text/html'});res.end(d)}});
}).listen(8100,()=>console.log('HTTP server on 8100'));
