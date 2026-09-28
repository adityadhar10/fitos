import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_fitos_key_99';

async function main() {
  const user = await prisma.user.findFirst();
  if (user) {
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    console.log(token);
  } else {
    console.log("No user found");
  }
  await prisma.$disconnect();
}
main();
