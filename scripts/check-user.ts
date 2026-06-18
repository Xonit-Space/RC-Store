import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking user...');
  const user = await prisma.user.findUnique({
    where: { email: 'admin@neoshop.com' }
  });
  console.log('User found:', !!user);
  if (user) {
    console.log('User hash:', user.passwordHash);
    const isValid = await bcrypt.compare('password123', user.passwordHash);
    console.log('Password valid:', isValid);
  } else {
    const users = await prisma.user.findMany({ take: 5 });
    console.log('Some users in DB:', users.map(u => u.email));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
