const fs = require('fs');

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix padding to align with transparent absolute navbar (pt-32 pb-24)
  content = content.replace(/<main className="flex-grow container mx-auto px-4 py-8">/, '<main className="flex-grow container mx-auto px-4 md:px-12 max-w-6xl pt-32 pb-24">');
  content = content.replace(/<main className="flex-1 container mx-auto px-4 py-8">/, '<main className="flex-1 container mx-auto px-4 md:px-12 max-w-6xl pt-32 pb-24">');

  // Replace default Tailwind cards with luxury flat styling
  content = content.replace(/bg-card border border-muted\/10/g, 'bg-background border border-border/40');
  content = content.replace(/bg-muted\/5\/50/g, 'bg-background');
  content = content.replace(/bg-muted\/5/g, 'bg-background');
  
  // Clean up shadow leftovers
  content = content.replace(/shadow-sm/g, '');
  content = content.replace(/shadow-md/g, '');
  content = content.replace(/shadow-lg/g, '');
  
  // Make checkout and cart more editorial
  content = content.replace(/rounded-none/g, '');
  content = content.replace(/rounded-3xl/g, '');
  content = content.replace(/rounded-xl/g, '');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated UI alignment for ${filePath}`);
}

updateFile('./src/app/cart/page.tsx');
updateFile('./src/app/checkout/page.tsx');
