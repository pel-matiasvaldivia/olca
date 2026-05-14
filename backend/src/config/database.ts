import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const dbUser = process.env.POSTGRES_USER || 'olca';
const dbPass = process.env.POSTGRES_PASSWORD || 'olca_secret';
const dbHost = process.env.POSTGRES_HOST || 'postgres';
const dbPort = process.env.POSTGRES_PORT || '5432';
const dbName = process.env.POSTGRES_DB || 'olca_db';

const encodedPass = encodeURIComponent(dbPass);
const dbUrl = `postgresql://${dbUser}:${encodedPass}@${dbHost}:${dbPort}/${dbName}`;

export const prisma =
  global.__prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

prisma.$connect().then(() => {
  logger.info('✅ PostgreSQL connected via Prisma');
}).catch((err) => {
  logger.error('❌ PostgreSQL connection failed:', err);
  process.exit(1);
});
