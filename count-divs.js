const fs = require('fs');
const content = fs.readFileSync('src/components/admin/product/tabs/media-tab.tsx', 'utf-8');
const lines = content.split('\n');

let depth = 0;
let insideReturn = false;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('return (')) insideReturn = true;
  if (!insideReturn) continue;
  
  const openCount = (line.match(/<div(\s|>)/g) || []).length;
  const closeCount = (line.match(/<\/div>/g) || []).length;
  
  depth += openCount - closeCount;
  
  if (openCount > 0 || closeCount > 0) {
    console.log(`Line ${i + 1}: +${openCount} -${closeCount} | depth: ${depth}`);
  }
  
  if (depth === 0 && closeCount > 0) {
    console.log(`Root div closed at line ${i + 1}!`);
  }
}
