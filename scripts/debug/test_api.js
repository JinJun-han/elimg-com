const https = require('https');

const body = JSON.stringify({
  messages: [
    { role: 'system', content: 'You are a Korean tutor. Answer in 1 sentence.' },
    { role: 'user', content: '안녕하세요' }
  ]
});

const req = https.request({
  hostname: 'elimg.com',
  path: '/api/chat',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
}, res => {
  console.log('Status:', res.statusCode);
  console.log('Content-Type:', res.headers['content-type']);
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    console.log('--- Response (first 500 chars) ---');
    console.log(data.slice(0, 500));
  });
});
req.write(body);
req.end();
req.on('error', e => console.error('Error:', e.message));
