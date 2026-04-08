const https = require('https');

https.get('https://elimg.com/HanwhaOcean_Level0_Lesson1.html', res => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    console.log('Total length:', data.length);
    console.log('sendAI present:', data.includes('sendAI'));
    console.log('api/chat present:', data.includes('api/chat'));
    console.log('then(r=>r:', data.includes('.then(r=>r'));
    console.log('then(async:', data.includes('.then(async'));
    console.log('r.body.getReader:', data.includes('r.body.getReader'));

    // Find api/chat
    const apiIdx = data.indexOf('api/chat');
    if (apiIdx >= 0) {
      console.log('\n--- around api/chat ---');
      console.log(data.slice(Math.max(0, apiIdx-200), apiIdx+500));
    } else {
      // Show last 1000 chars to see what's at the end
      console.log('\n--- last 500 chars ---');
      console.log(data.slice(-500));
    }
  });
}).on('error', e => console.error(e.message));
