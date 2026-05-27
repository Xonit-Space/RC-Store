const fs = require('fs');
const path = require('path');

function replaceTokens(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Theme Replacements
  content = content.replace(/slate-50/g, 'muted/5');
  content = content.replace(/slate-100/g, 'muted/10');
  content = content.replace(/slate-200/g, 'border/40');
  content = content.replace(/slate-300/g, 'muted-foreground/30');
  content = content.replace(/slate-400/g, 'muted-foreground');
  content = content.replace(/slate-500/g, 'muted-foreground');
  content = content.replace(/slate-600/g, 'foreground/70');
  content = content.replace(/slate-700/g, 'foreground');
  content = content.replace(/slate-800/g, 'foreground');
  content = content.replace(/slate-900/g, 'foreground');
  
  content = content.replace(/blue-[0-9]+/g, 'foreground');
  content = content.replace(/purple-[0-9]+/g, 'foreground');
  content = content.replace(/rounded-2xl/g, 'rounded-none');
  content = content.replace(/rounded-xl/g, 'rounded-none');
  content = content.replace(/rounded-lg/g, 'rounded-none');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      walkDir(dirPath);
    } else if (dirPath.endsWith('.tsx') || dirPath.endsWith('.ts')) {
      replaceTokens(dirPath);
    }
  });
}

walkDir('./src');
