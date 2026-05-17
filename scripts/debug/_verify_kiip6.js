const fs = require('fs');
const c = fs.readFileSync('C:/Users/kodhj/elimg-com/KIIP_Level2_Lesson6.html', 'utf8');

const terms = ['#1E3A5F','#2E75B6','#1e3a5f','#2e75b6','한화오션','HANWHA OCEAN','Hanwha Ocean','HanwhaOcean_Level2_Lesson','조선소','LNG 운반선'];
terms.forEach(function(term) {
  const count = (c.split(term).length - 1);
  console.log((count===0?'OK':'WARN') + ' "' + term + '": ' + count);
});

const titleMatch = c.match(/<title>[^<]*<\/title>/);
const ogUrl = c.match(/og:url" content="[^"]+"/);
console.log('\nTitle:', titleMatch ? titleMatch[0] : 'NOT FOUND');
console.log('OG URL:', ogUrl ? ogUrl[0] : 'NOT FOUND');
console.log('#1e40af count:', c.split('#1e40af').length - 1);
console.log('#3b82f6 count:', c.split('#3b82f6').length - 1);
const kiipHrefs = c.split('href="/KIIP_Level2').length - 1;
console.log('KIIP_Level2 hrefs:', kiipHrefs);
console.log('File size:', c.length, 'bytes');
