import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { logger } from '../config/logger';

async function seed() {
  logger.info('🌱 Seeding database...');

  // Create demo organization
  const org = await prisma.organization.upsert({
    where: { slug: 'olca' },
    update: {},
    create: {
      nombre: 'OLCA Rental',
      dominio: 'olca.com.ar',
      slug: 'olca',
      logo: 'https://olca.com.ar/wp-content/uploads/logo.png',
      plan: 'enterprise',
    },
  });

  logger.info(`✅ Organization: ${org.nombre} (${org.slug})`);

  // Create admin user
  const hashedPwd = await bcrypt.hash('Admin123!', 12);

  const admin = await prisma.user.upsert({
    where: { email_organizationId: { email: 'admin@olca.com', organizationId: org.id } },
    update: {},
    create: {
      email: 'admin@olca.com',
      password: hashedPwd,
      nombre: 'Admin',
      apellido: 'OLCA',
      rol: 'ADMIN',
      organizationId: org.id,
    },
  });

  const sales = await prisma.user.upsert({
    where: { email_organizationId: { email: 'ventas@olca.com', organizationId: org.id } },
    update: {},
    create: {
      email: 'ventas@olca.com',
      password: hashedPwd,
      nombre: 'Comercial',
      apellido: 'Demo',
      rol: 'SALES',
      organizationId: org.id,
    },
  });

  logger.info(`✅ Users: ${admin.email}, ${sales.email}`);
  logger.info('');
  logger.info('🔑 Credenciales de acceso:');
  logger.info('   URL:          http://localhost:5173');
  logger.info('   Org slug:     olca');
  logger.info('   Admin:        admin@olca.com / Admin123!');
  logger.info('   Ventas:       ventas@olca.com / Admin123!');
  logger.info('');
  logger.info('✅ Seed completed!');
}

seed()
  .catch((e) => { logger.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
