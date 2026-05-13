import { FastifyInstance } from 'fastify';
import { prisma } from '../config/database';
import { cacheGet, cacheSet, cacheDelete, cacheKeys, CACHE_TTL } from '../config/redis';
import { authenticate, requireRole } from '../middleware/auth';
import { getMockProducts, getMockProductById } from '../integrations/mock';
import { createOdooConnector } from '../integrations/odoo';
import { ProductDTO } from '../types';
import { Role } from '@prisma/client';

export default async function erpRoutes(app: FastifyInstance) {

  // ── GET /api/erp/products ─────────────────────────────
  // Público para clientes que quieren cotizar

  app.get('/products', {
    schema: {
      tags: ['ERP'],
      summary: 'Listar productos disponibles',
      querystring: {
        type: 'object',
        properties: {
          categoria: { type: 'string' },
          search: { type: 'string' },
          orgSlug: { type: 'string' },
        },
      },
    },
  }, async (req, reply) => {
    const { categoria, search, orgSlug } = req.query as {
      categoria?: string; search?: string; orgSlug?: string;
    };

    // Resolve organization
    let orgId: string | null = null;
    if (orgSlug) {
      const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
      orgId = org?.id ?? null;
    }

    const cacheKey = orgId ? cacheKeys.products(orgId) : 'global:products';

    // Try cache first
    let products = await cacheGet<ProductDTO[]>(cacheKey);
    if (!products) {
      if (orgId) {
        const dbProducts = await prisma.product.findMany({
          where: { organizationId: orgId, activo: true },
          orderBy: { nombre: 'asc' },
        });
        products = dbProducts.map((p) => ({
          id: p.id,
          erpId: p.erpId,
          nombre: p.nombre,
          descripcion: p.descripcion ?? undefined,
          categoria: p.categoria,
          subcategoria: p.subcategoria ?? undefined,
          precioBase: p.precioBase,
          stock: p.stock,
          imagen: p.imagen ?? undefined,
          especificaciones: p.especificaciones as Record<string, unknown> ?? undefined,
          marca: p.marca ?? undefined,
          modelo: p.modelo ?? undefined,
          anio: p.anio ?? undefined,
        }));
      } else {
        // Fallback to mock data
        products = getMockProducts();
      }
      await cacheSet(cacheKey, products, CACHE_TTL.PRODUCTS);
    }

    // Apply filters
    let filtered = products;
    if (categoria) filtered = filtered.filter((p) => p.categoria === categoria);
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) => p.nombre.toLowerCase().includes(q) || p.descripcion?.toLowerCase().includes(q)
      );
    }

    const categorias = [...new Set(products.map((p) => p.categoria))].sort();

    return reply.send({
      success: true,
      data: {
        products: filtered,
        categorias,
        total: filtered.length,
      },
    });
  });

  // ── GET /api/erp/products/:id ─────────────────────────

  app.get('/products/:id', {
    schema: {
      tags: ['ERP'],
      summary: 'Obtener producto por ID',
    },
  }, async (req, reply) => {
    const { id } = req.params as { id: string };

    // Try DB first
    const dbProduct = await prisma.product.findUnique({ where: { id } });
    if (dbProduct) {
      return reply.send({ success: true, data: dbProduct });
    }

    // Fallback mock
    const mock = getMockProductById(id);
    if (mock) return reply.send({ success: true, data: mock });

    return reply.code(404).send({ success: false, error: 'Producto no encontrado' });
  });

  // ── POST /api/erp/sync ────────────────────────────────
  // Solo admins pueden disparar sync manual

  app.post('/sync', {
    preHandler: [authenticate, requireRole(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)],
    schema: { tags: ['ERP'], summary: 'Sincronización manual con ERP' },
  }, async (req, reply) => {
    const { organizationId } = req.user;

    const erpConfig = await prisma.eRPConfig.findUnique({ where: { organizationId } });
    if (!erpConfig) {
      // Org without ERP config — sync mock
      return reply.send({ success: true, message: 'Mock mode: sin config ERP', synced: 0 });
    }

    if (process.env.ERP_MOCK_MODE === 'true') {
      const mocks = getMockProducts();
      // Upsert mock products
      for (const p of mocks) {
        await prisma.product.upsert({
          where: { erpId_organizationId: { erpId: p.erpId, organizationId } },
          update: {
            nombre: p.nombre,
            precioBase: p.precioBase,
            stock: p.stock,
            ultimaSincronizacion: new Date(),
          },
          create: {
            erpId: p.erpId,
            nombre: p.nombre,
            descripcion: p.descripcion,
            categoria: p.categoria,
            subcategoria: p.subcategoria,
            precioBase: p.precioBase,
            stock: p.stock,
            imagen: p.imagen,
            marca: p.marca,
            modelo: p.modelo,
            anio: p.anio,
            ultimaSincronizacion: new Date(),
            organizationId,
          },
        });
      }
      await cacheDelete(cacheKeys.products(organizationId));
      return reply.send({ success: true, message: 'Sync mock completado', synced: mocks.length });
    }

    // Real Odoo sync
    const connector = createOdooConnector({
      url: erpConfig.apiUrl,
      db: erpConfig.database ?? '',
      username: erpConfig.username ?? '',
      apiKey: erpConfig.apiKey,
    });

    const products = await connector.getProducts();
    for (const p of products) {
      await prisma.product.upsert({
        where: { erpId_organizationId: { erpId: p.erpId, organizationId } },
        update: { nombre: p.nombre, precioBase: p.precioBase, stock: p.stock, ultimaSincronizacion: new Date() },
        create: {
          erpId: p.erpId, nombre: p.nombre, descripcion: p.descripcion,
          categoria: p.categoria, precioBase: p.precioBase, stock: p.stock,
          imagen: p.imagen, ultimaSincronizacion: new Date(), organizationId,
        },
      });
    }

    await cacheDelete(cacheKeys.products(organizationId));

    return reply.send({ success: true, message: 'Sync Odoo completado', synced: products.length });
  });

  // ── GET /api/erp/categorias ───────────────────────────

  app.get('/categorias', {
    schema: { tags: ['ERP'], summary: 'Listar categorías disponibles' },
  }, async (_req, reply) => {
    const products = getMockProducts();
    const categorias = [...new Set(products.map((p) => p.categoria))].sort();
    return reply.send({ success: true, data: categorias });
  });
}
