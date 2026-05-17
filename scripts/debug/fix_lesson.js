const fs = require('fs');
const file = process.argv[2];
let content = fs.readFileSync(file, 'utf8');

// Find renderAI function and fix backslash+backtick and backslash+dollar
const renderAIStart = content.indexOf('function renderAI()');
if (renderAIStart === -1) { process.stdout.write('renderAI not found!\n'); process.exit(1); }

// Find end of renderAI - look for the closing of the function
// It ends with }  followed by render(); or </script>
const afterRenderAI = content.slice(renderAIStart);
// Find the last } before render(); or </script>
const endMarkers = ['\n}\n\n\nrender();', '\n}\n\nrender();', '\n}\n</script>', '\n}\n\n</script>'];
let renderAIEnd = -1;
for (const marker of endMarkers) {
  const idx = content.indexOf(marker, renderAIStart);
  if (idx !== -1) {
    renderAIEnd = idx + 2; // include the }
    break;
  }
}

if (renderAIEnd === -1) {
  // fallback: find closing brace
  renderAIEnd = content.indexOf('\n}', renderAIStart + 100) + 2;
}

const before = content.slice(0, renderAIStart);
let renderAI = content.slice(renderAIStart, renderAIEnd);
const after = content.slice(renderAIEnd);

const backslashBacktick = (renderAI.match(/\\\x60/g) || []).length;
const backslashDollar = (renderAI.match(/\\\$/g) || []).length;
process.stdout.write('File: ' + file + '\n');
process.stdout.write('Backslash+backtick: ' + backslashBacktick + '\n');
process.stdout.write('Backslash+dollar: ' + backslashDollar + '\n');

renderAI = renderAI.replace(/\\\x60/g, '\x60').replace(/\\\$/g, '$');

content = before + renderAI + after;
fs.writeFileSync(file, content, 'utf8');
process.stdout.write('Fixed and saved!\n');
