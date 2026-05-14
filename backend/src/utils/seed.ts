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
  // --- Mock Products ---
  const mockProducts = [
    { erpId: 'M-01', nombre: 'Toyota Hilux 4x4 SRX', categoria: 'Pickups 4x4', precioBase: 55000, stock: 8, marca: 'Toyota', modelo: 'Hilux', anio: 2024, imagen: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80', imagenes: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'], especificaciones: { Transmisión: 'Automática', Tracción: '4x4', Combustible: 'Diésel', Pasajeros: 5, Equipamiento: 'Full, Lona marítima, Barra antivuelco' }, ultimaSincronizacion: new Date(), organizationId: org.id },
    { erpId: 'M-02', nombre: 'Ford Ranger XLT 4x4', categoria: 'Pickups 4x4', precioBase: 52000, stock: 5, marca: 'Ford', modelo: 'Ranger', anio: 2024, imagen: 'https://images.unsplash.com/photo-1600122956557-01121d5a3fc5?auto=format&fit=crop&w=800&q=80', imagenes: ['https://images.unsplash.com/photo-1600122956557-01121d5a3fc5?auto=format&fit=crop&w=800&q=80'], especificaciones: { Transmisión: 'Manual', Tracción: '4x4', Combustible: 'Diésel', Pasajeros: 5, Equipamiento: 'Enganche remolque, Cobertor caja' }, ultimaSincronizacion: new Date(), organizationId: org.id },
    { erpId: 'M-03', nombre: 'Volkswagen Amarok V6', categoria: 'Pickups 4x4', precioBase: 65000, stock: 3, marca: 'Volkswagen', modelo: 'Amarok', anio: 2024, imagen: 'https://images.unsplash.com/photo-1559404283-7d7ea2687e14?auto=format&fit=crop&w=800&q=80', imagenes: ['https://images.unsplash.com/photo-1559404283-7d7ea2687e14?auto=format&fit=crop&w=800&q=80'], especificaciones: { Transmisión: 'Automática', Tracción: '4x4 (4Motion)', Combustible: 'Diésel V6', Pasajeros: 5, Equipamiento: 'Premium, Cuero, Asientos eléctricos' }, ultimaSincronizacion: new Date(), organizationId: org.id },
    { erpId: 'M-04', nombre: 'Renault Kangoo Express', categoria: 'Utilitarios', precioBase: 35000, stock: 12, marca: 'Renault', modelo: 'Kangoo', anio: 2023, imagen: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=800&q=80', imagenes: ['https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=800&q=80'], especificaciones: { Transmisión: 'Manual', Tracción: '4x2', Combustible: 'Nafta', CapacidadCarga: '750 kg', Puertas: 'Portón lateral corredizo' }, ultimaSincronizacion: new Date(), organizationId: org.id },
    { erpId: 'M-05', nombre: 'MB Sprinter Furgón', categoria: 'Utilitarios', precioBase: 85000, stock: 4, marca: 'Mercedes-Benz', modelo: 'Sprinter', anio: 2024, imagen: 'https://images.unsplash.com/photo-1566453966023-e18e87e1e63d?auto=format&fit=crop&w=800&q=80', imagenes: ['https://images.unsplash.com/photo-1566453966023-e18e87e1e63d?auto=format&fit=crop&w=800&q=80'], especificaciones: { Transmisión: 'Manual', Tracción: 'Trasera', Combustible: 'Diésel', CapacidadVolumen: '10.5 m3', Equipamiento: 'Cámara retroceso, Control crucero' }, ultimaSincronizacion: new Date(), organizationId: org.id }
  ];

  for (const prod of mockProducts) {
    await prisma.product.upsert({
      where: { erpId_organizationId: { erpId: prod.erpId, organizationId: org.id } },
      update: prod,
      create: prod,
    });
  }
  logger.info(`✅ ${mockProducts.length} vehículos Mock cargados`);
  
  logger.info('✅ Seed completed!');
}

seed()
  .catch((e) => { logger.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
