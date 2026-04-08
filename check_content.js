const https = require('https');

function fetchFollow(path, cb) {
  const req = https.request({ hostname: 'elimg.com', path, method: 'GET',
    headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html' }
  }, res => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      console.log('Redirect:', res.statusCode, res.headers.location);
      fetchFollow(res.headers.location, cb);
      return;
    }
    let data = '';
    res.on('data', chunk => { data += chunk.toString(); });
    res.on('end', () => cb(res.statusCode, data));
  });
  req.on('error', e => console.error('Error:', e.message));
  req.end();
}

fetchFollow('/HanwhaOcean_Level0_Lesson1.html', (status, data) => {
  console.log('Final Status:', status, 'Length:', data.length);
  console.log('sendAI:', data.includes('sendAI'));
  console.log('api/chat:', data.includes('api/chat'));
  console.log('then(async r:', data.includes('.then(async r=>'));
  console.log('old then(r=>r.json:', data.includes('.then(r=>r.json()'));
  console.log('_rd=r.body:', data.includes('_rd=r.body'));
  console.log('res.body.getReader:', data.includes('res.body.getReader'));

  const idx = data.indexOf('api/chat');
  if (idx >= 0) {
    console.log('\n--- around api/chat (400 chars) ---');
    console.log(data.slice(Math.max(0, idx-100), idx+400));
  }
});
