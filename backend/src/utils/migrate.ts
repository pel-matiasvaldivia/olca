import { execSync } from 'child_process';

const dbUser = process.env.POSTGRES_USER || 'olca';
const dbPass = process.env.POSTGRES_PASSWORD || 'olca_secret';
const dbHost = process.env.POSTGRES_HOST || 'postgres';
const dbPort = process.env.POSTGRES_PORT || '5432';
const dbName = process.env.POSTGRES_DB || 'olca_db';

const encodedPass = encodeURIComponent(dbPass);
const dbUrl = `postgresql://${dbUser}:${encodedPass}@${dbHost}:${dbPort}/${dbName}`;

console.log('🚀 Iniciando migraciones de Prisma...');

try {
  execSync('npx prisma migrate deploy', {
    env: {
      ...process.env,
      DATABASE_URL: dbUrl,
    },
    stdio: 'inherit',
  });
  console.log('✅ Migraciones completadas exitosamente.');
} catch (error) {
  console.error('❌ Error ejecutando migraciones:', error);
  process.exit(1);
}
