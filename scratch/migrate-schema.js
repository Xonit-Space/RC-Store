const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// Replace Float with Decimal for currency fields
// Note: We'll just replace Float with Decimal where it's used as a type
schema = schema.replace(/(\s+)Float(\??)/g, '$1Decimal$2');

// Add audit fields and soft deletes to major models
const modelsToUpdate = ['User', 'Product', 'Order', 'Category', 'Brand', 'Coupon'];

modelsToUpdate.forEach(model => {
  const modelRegex = new RegExp(`(model\\s+${model}\\s+\\{[\\s\\S]*?)(@@)`, 'g');
  schema = schema.replace(modelRegex, (match, p1, p2) => {
    let newFields = '';
    if (!p1.includes('deletedAt')) {
      newFields += '  deletedAt     DateTime?\n';
    }
    if (!p1.includes('createdBy') && model !== 'User') {
      newFields += '  createdBy     String?\n';
    }
    if (!p1.includes('updatedBy') && model !== 'User') {
      newFields += '  updatedBy     String?\n';
    }
    return p1 + newFields + '  ' + p2;
  });
});

// Remove Cascade delete from User to Order
schema = schema.replace(
  /user(\s+)User(\s+)@relation\(fields: \[userId\], references: \[id\], onDelete: Cascade\)/g,
  'user$1User$2@relation(fields: [userId], references: [id], onDelete: Restrict)'
);

fs.writeFileSync(schemaPath, schema);
console.log('Schema updated successfully');
