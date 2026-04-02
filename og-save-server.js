const http = require('http');
const fs = require('fs');
const path = require('path');

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }
  if (req.method === 'POST') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
      try {
        const { filename, data } = JSON.parse(body);
        const base64 = data.replace(/^data:image\/png;base64,/, '');
        const outPath = path.join('C:/Users/kodhj/elimg-com/images', filename);
        fs.writeFileSync(outPath, Buffer.from(base64, 'base64'));
        res.writeHead(200, {'Content-Type':'application/json'});
        res.end(JSON.stringify({ok: true, path: outPath}));
      } catch(e) {
        res.writeHead(500); res.end(e.message);
      }
    });
  }
}).listen(7824, () => console.log('save-server ready on 7824'));
