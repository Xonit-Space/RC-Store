const fs = require("fs");
const path = require("path");

const SRC_DIR = path.join(__dirname, "src");

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) walkDir(dirPath, callback);
    else if (dirPath.endsWith(".tsx") || dirPath.endsWith(".ts")) callback(dirPath);
  });
}

const replacementStr = '.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })';

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  let original = content;

  // Find Rs. { ... } or Rs. ${ ... }
  // We'll just replace known bad endings
  
  // 1. replace `.toLocaleString()` with the full one
  content = content.replace(/\.toLocaleString\(\)/g, replacementStr);
  
  // 2. replace `.toLocaleString("en-US", { minimumFractionDigits: 2 })` with the full one
  content = content.replace(/\.toLocaleString\("en-US", \{ minimumFractionDigits: 2 \}\)/g, replacementStr);
  
  // 3. replace `.toLocaleString(undefined, { minimumFractionDigits: 2 })` with the full one
  content = content.replace(/\.toLocaleString\(undefined, \{ minimumFractionDigits: 2 \}\)/g, replacementStr);
  
  // 4. replace `.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })` with the full one
  content = content.replace(/\.toLocaleString\(undefined, \{ minimumFractionDigits: 2, maximumFractionDigits: 2 \}\)/g, replacementStr);

  // 5. replace `.toFixed(2)` with the full one, but wait, `toFixed(2)` returns a string. `toLocaleString` also returns a string. So we can just replace `.toFixed(2)` with `.toLocaleString("en-US", ...)` IF it's called on a Number. 
  // Wait, if it's `Rs. {Number(o.total).toFixed(2)}`, then `.toLocaleString(...)` works.
  // What if it's `shipping.toFixed(2)` where shipping is a number? `.toLocaleString(...)` works.
  content = content.replace(/\.toFixed\(2\)/g, replacementStr);

  // Also fix: `Rs. {profile?.storeCredits?.[0]?.balance || 0}`
  // -> `Rs. {Number(profile?.storeCredits?.[0]?.balance || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  content = content.replace(/Rs\. \{profile\?\.storeCredits\?\.\[0\]\?\.balance \|\| 0\}/g, `Rs. {Number(profile?.storeCredits?.[0]?.balance || 0)${replacementStr}}`);

  // Fix: `Rs. {item.price}`
  content = content.replace(/Rs\. \{item\.price\}/g, `Rs. {Number(item.price)${replacementStr}}`);

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${filePath}`);
  }
}

walkDir(SRC_DIR, fixFile);
console.log("Currency formatting completed.");
