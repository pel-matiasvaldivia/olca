import cron from 'node-cron';
import { prisma } from '../config/database';
import { cacheDelete, cacheKeys } from '../config/redis';
import { createOdooConnector } from '../integrations/odoo';
import { getMockProducts } from '../integrations/mock';
import { logger } from '../config/logger';

async function syncOrganization(orgId: string): Promise<void> {
  const erpConfig = await prisma.eRPConfig.findUnique({ where: { organizationId: orgId } });

  let products = getMockProducts();

  if (erpConfig && process.env.ERP_MOCK_MODE !== 'true') {
    const connector = createOdooConnector({
      url: erpConfig.apiUrl,
      db: erpConfig.database ?? '',
      username: erpConfig.username ?? '',
      apiKey: erpConfig.apiKey,
    });
    products = await connector.getProducts();
  }

  for (const p of products) {
    await prisma.product.upsert({
      where: { erpId_organizationId: { erpId: p.erpId, organizationId: orgId } },
      update: { nombre: p.nombre, precioBase: p.precioBase, stock: p.stock, ultimaSincronizacion: new Date() },
      create: {
        erpId: p.erpId, nombre: p.nombre, descripcion: p.descripcion,
        categoria: p.categoria, subcategoria: p.subcategoria,
        precioBase: p.precioBase, stock: p.stock, imagen: p.imagen,
        marca: p.marca, modelo: p.modelo, anio: p.anio,
        ultimaSincronizacion: new Date(), organizationId: orgId,
      },
    });
  }

  await cacheDelete(cacheKeys.products(orgId));

  if (erpConfig) {
    await prisma.eRPConfig.update({
      where: { organizationId: orgId },
      data: { ultimoSync: new Date(), proximoSync: new Date(Date.now() + 60 * 60 * 1000) },
    });
  }

  logger.info(`✅ Sync completed for org ${orgId}: ${products.length} products`);
}

export function startSyncJob(): void {
  // Run every hour
  cron.schedule('0 * * * *', async () => {
    logger.info('⚙️  Starting ERP sync job...');
    const orgs = await prisma.organization.findMany({ where: { activa: true }, select: { id: true } });
    for (const org of orgs) {
      await syncOrganization(org.id).catch((err) =>
        logger.error(`Sync failed for org ${org.id}:`, err)
      );
    }
  });

  logger.info('⏰ ERP sync job scheduled (every hour)');
}
