const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
async function test() {
  const images = await db.productImage.findMany({
    where: { product: { category: { slug: { contains: "parts" } } } },
    take: 50,
  });
  console.log("Parts images length:", images.length);
  if (images.length === 0) {
    const fallback = await db.productImage.findMany({ take: 20 });
    const shuffled = fallback.sort(() => 0.5 - Math.random());
    console.log("Fallback urls:", shuffled.slice(0, 5).map(img => img.url));
  } else {
    const shuffled = images.sort(() => 0.5 - Math.random());
    console.log("Parts urls:", shuffled.slice(0, 5).map(img => img.url));
  }
}
test();
