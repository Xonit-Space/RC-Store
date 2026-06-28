const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if(file.endsWith('.tsx')) results.push(file);
        }
    });
    return results;
}

const files = walk('./src/app/admin');
let changedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const original = content;
    
    // Replace the specific hover shadow classes
    content = content.replace(/ hover:shadow-\[0_10px_40px_rgba\(255,204,0,0\.15\)\] dark:hover:shadow-\[0_0_50px_rgba\(255,204,0,0\.3\)\] hover:border-racing-yellow\/50/g, '');
    content = content.replace(/ hover:shadow-\[0_10px_40px_rgba\(255,204,0,0\.15\)\] dark:shadow-\[0_0_50px_rgba\(0,0,0,0\.5\)\] dark:hover:shadow-\[0_0_50px_rgba\(255,204,0,0\.3\)\] hover:border-racing-yellow\/50/g, '');
    
    // Some might have different spacing, let's be more aggressive with regex
    content = content.replace(/\s*hover:shadow-\[0_10px_40px_rgba\(255,204,0,0\.15\)\]\s*/g, ' ');
    content = content.replace(/\s*dark:hover:shadow-\[0_0_50px_rgba\(255,204,0,0\.3\)\]\s*/g, ' ');
    content = content.replace(/\s*hover:border-racing-yellow\/50\s*/g, ' ');

    if (content !== original) {
        fs.writeFileSync(file, content);
        changedCount++;
        console.log(`Updated ${file}`);
    }
});

console.log(`Done. Changed ${changedCount} files.`);
