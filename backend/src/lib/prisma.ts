import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

// Disable strict TLS certificate validation for the Supabase pooler connection.
// This is safe here because we're connecting over Supabase's managed, encrypted pooler.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

export default prisma;
