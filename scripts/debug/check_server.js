const https = require('https');

// Check what the server is currently serving for Lesson 1
https.get('https://elimg.com/HanwhaOcean_Level0_Lesson1.html', res => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    // Check for streaming code presence
    console.log('then_async_r:', data.includes('.then(async r=>'));
    console.log('_rd=r.body:', data.includes('_rd=r.body'));
    console.log('old_json:', data.includes('.then(r=>r.json())'));
    console.log('CF-Cache-Status would show in headers');

    // Find the sendAI area
    const idx = data.indexOf('function sendAI');
    if (idx >= 0) {
      console.log('\n--- sendAI function (first 800 chars) ---');
      console.log(data.slice(idx, idx + 800));
    }
  });
}).on('error', e => console.error(e.message));
