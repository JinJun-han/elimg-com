const fs = require('fs');
const path = require('path');
const dir = __dirname;

// 모든 레슨 파일 찾기
const files = fs.readdirSync(dir).filter(f =>
  /HanwhaOcean_Level\d_Lesson\d+\.html$/i.test(f)
);

const TAG = '<script src="/hw-shared.js"></script>';
let updated = 0, skipped = 0;

files.forEach(file => {
  const fp = path.join(dir, file);
  let content = fs.readFileSync(fp, 'utf8');

  // 이미 포함된 경우 스킵
  if (content.includes('hw-shared.js')) {
    skipped++;
    return;
  }

  // </body> 앞에 삽입
  if (content.includes('</body>')) {
    content = content.replace('</body>', TAG + '\n</body>');
    fs.writeFileSync(fp, content, 'utf8');
    updated++;
    process.stdout.write('✅ ' + file + '\n');
  } else {
    process.stdout.write('⚠️  </body> not found: ' + file + '\n');
  }
});

process.stdout.write('\nDone: ' + updated + ' updated, ' + skipped + ' skipped\n');
