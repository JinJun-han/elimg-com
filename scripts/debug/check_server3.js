const https = require('https');

const options = {
  hostname: 'elimg.com',
  path: '/HanwhaOcean_Level0_Lesson1.html',
  method: 'GET',
  headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html' }
};

const req = https.request(options, res => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));

  let data = '';
  res.on('data', chunk => { data += chunk.toString(); });
  res.on('end', () => {
    console.log('\nTotal length:', data.length);
    if (data.length > 0) {
      console.log('sendAI:', data.includes('sendAI'));
      console.log('api/chat:', data.includes('api/chat'));
      const idx = data.indexOf('api/chat');
      if (idx >= 0) {
        console.log('\n--- around api/chat ---');
        console.log(data.slice(Math.max(0, idx-200), idx+400));
      }
    }
  });
});
req.on('error', e => console.error('Error:', e.message));
req.end();
