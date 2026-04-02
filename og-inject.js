const fs = require('fs');
const path = require('path');
const dir = 'C:/Users/kodhj/elimg-com';

const files = fs.readdirSync(dir).filter(f => f.match(/HanwhaOcean_(Level1|Level2).*\.html$/));

files.forEach(file => {
  const isLv1 = file.includes('Level1');
  const lessonMatch = file.match(/Lesson(\d+)/);
  const lessonNum = lessonMatch ? lessonMatch[1] : null;

  const fullPath = path.join(dir, file);
  let html = fs.readFileSync(fullPath, 'utf8');
  const titleMatch = html.match(/<title>([^<]*)<\/title>/);
  const pageTitle = titleMatch ? titleMatch[1].trim() : (isLv1 ? '한화오션 한국어교육 초급 1급' : '한화오션 한국어교육 초급 2급');

  const imgFile = isLv1 ? 'og-hanwha-level1.png' : 'og-hanwha-level2.png';

  let desc = isLv1
    ? '한화오션 해외근로자 한국어교육 · 초급 1급 · 생활 한국어 20과 커리큘럼'
    : '한화오션 해외근로자 한국어교육 · 초급 2급 · 비즈니스 한국어 20과 커리큘럼';
  if (lessonNum) {
    desc = (isLv1 ? '초급 1급 ' : '초급 2급 ') + lessonNum + '과 · 한화오션 한국어교육 · KIIP 사회통합프로그램';
  }

  const ogTags = `
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="한화오션 한국어교육 · GlocalBridge">
    <meta property="og:title" content="${pageTitle}">
    <meta property="og:description" content="${desc}">
    <meta property="og:image" content="https://elimg.com/images/${imgFile}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:url" content="https://elimg.com/${file}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${pageTitle}">
    <meta name="twitter:description" content="${desc}">
    <meta name="twitter:image" content="https://elimg.com/images/${imgFile}">`;

  // 기존 OG 태그 제거
  html = html.replace(/<meta property="og:[^"]*"[^>]*>/g, '');
  html = html.replace(/<meta name="twitter:[^"]*"[^>]*>/g, '');
  // </title> 바로 뒤에 삽입
  html = html.replace('</title>', '</title>' + ogTags);

  fs.writeFileSync(fullPath, html, 'utf8');
  console.log('✓', file);
});
console.log('\n완료:', files.length + '개 파일');
