const fs = require('fs');
const content = fs.readFileSync('HanwhaOcean_Level1_Lesson20.html', 'utf8');
const sc = content.split('<script>')[1].substring(0, content.split('<script>')[1].indexOf('</script>'));
const lines = sc.split('\n');

let issues = [];
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  let sqCount = 0;
  const bs = '\';
  for (let j = 0; j < l.length; j++) {
    if (l[j] === bs) { j++; continue; }
    if (l[j] === "'") sqCount++;
  }
  if (sqCount % 2 !== 0) {
    issues.push('Line ' + (i+1) + ' odd SQ(' + sqCount + '): ' + l.substring(0, 100));
  }
}
if (issues.length) {
  console.log('Issues found:');
  issues.slice(0, 20).forEach(x => console.log(x));
} else {
  console.log('No odd-SQ lines found');
}
