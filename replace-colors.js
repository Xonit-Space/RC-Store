const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const tailwindConfig = path.join(__dirname, 'tailwind.config.ts');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

function replaceInFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts') && !filePath.endsWith('.css')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content
    .replace(/rgba\(255,\s*30,\s*30/g, 'rgba(255, 204, 0')
    .replace(/racing-red/g, 'racing-yellow')
    .replace(/neon-red/g, 'neon-yellow')
    .replace(/text-red-500/g, 'text-yellow-500')
    .replace(/text-red-400/g, 'text-yellow-400')
    .replace(/bg-red-500/g, 'bg-yellow-500')
    .replace(/bg-red-600/g, 'bg-yellow-600');

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent);
    console.log('Updated:', filePath);
  }
}

// Update src files
walkDir(srcDir, replaceInFile);

// Update tailwind config
replaceInFile(tailwindConfig);

console.log('Done!');
