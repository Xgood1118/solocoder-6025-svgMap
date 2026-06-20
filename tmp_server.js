const http = require('http'), fs = require('fs'), path = require('path');
const mime = {'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png'};
const dir = 'C:/Users/白东鑫/work01/SoloCoder/6025-svgMap/demo/html';
const srv = http.createServer((req,res)=>{
  let fp = path.join(dir, req.url==='/'?'test-r2.html':req.url);
  const ext = path.extname(fp);
  fs.readFile(fp,(e,d)=>{if(e){res.writeHead(404);res.end('Not found')}else{res.writeHead(200,{'Content-Type':mime[ext]||'text/html'});res.end(d)}});
});
srv.listen(8100,()=>console.log('HTTP server on 8100'));
