import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import dayjs from 'dayjs';
import { prisma } from '../config/database';
import { authenticate, requireRole } from '../middleware/auth';
import { getMockProductById, getMockProducts } from '../integrations/mock';
import { cacheDelete, cacheKeys } from '../config/redis';
import { Role, QuoteStatus } from '@prisma/client';
import { CreateQuoteBody, PriceCalculation } from '../types';
import { sendQuoteEmail } from '../jobs/sendEmails';

const IVA_RATE = 21; // % IVA Argentina

// ── Price Calculation ─────────────────────────────────

async function calculatePrice(
  items: { productId: string; cantidad: number; fechaInicio: string; fechaFin: string }[],
  descuentoPct: number = 0,
  organizationId?: string,
): Promise<PriceCalculation> {
  const calculated = [];
  let subtotalBruto = 0;

  for (const item of items) {
    const dias = dayjs(item.fechaFin).diff(dayjs(item.fechaInicio), 'day');
    if (dias <= 0) throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');

    // Try DB first, then mock
    let product = null;
    if (organizationId) {
      product = await prisma.product.findUnique({ where: { id: item.productId } });
    }

    const mockProduct = getMockProductById(item.productId);
    const precioUnitario = product?.precioBase ?? mockProduct?.precioBase ?? 0;
    const nombre = product?.nombre ?? mockProduct?.nombre ?? 'Producto';

    if (!precioUnitario) throw new Error(`Producto ${item.productId} no encontrado`);

    const subtotal = precioUnitario * item.cantidad * dias;
    subtotalBruto += subtotal;

    calculated.push({
      productId: item.productId,
      productoNombre: nombre,
      cantidad: item.cantidad,
      diasAlquiler: dias,
      precioUnitario,
      subtotal,
    });
  }

  const descuentoMonto = subtotalBruto * (descuentoPct / 100);
  const baseImponible = subtotalBruto - descuentoMonto;
  const ivaMonto = baseImponible * (IVA_RATE / 100);
  const total = baseImponible + ivaMonto;

  return {
    items: calculated,
    subtotal: subtotalBruto,
    descuentoPct,
    descuentoMonto,
    ivaRate: IVA_RATE,
    ivaMonto,
    total,
  };
}

// ── Routes ────────────────────────────────────────────

export default async function quoteRoutes(app: FastifyInstance) {

  // POST /api/quotes/calculate — sin autenticación (cliente calcula antes de enviar)
  app.post('/calculate', {
    schema: {
      tags: ['Quotes'],
      summary: 'Calcular precio de cotización (sin persistir)',
    },
  }, async (req, reply) => {
    const body = req.body as { items: CreateQuoteBody['items']; descuentoPct?: number; orgSlug?: string };
    const calc = await calculatePrice(body.items, body.descuentoPct);
    return reply.send({ success: true, data: calc });
  });

  // POST /api/quotes — crear cotización (público para clientes)
  app.post('/', {
    schema: { tags: ['Quotes'], summary: 'Crear nueva cotización' },
  }, async (req, reply) => {
    const body = req.body as CreateQuoteBody & { orgSlug: string };

    const org = await prisma.organization.findUnique({ where: { slug: body.orgSlug ?? 'olca' } });
    if (!org) return reply.code(404).send({ success: false, error: 'Organización no encontrada' });

    // Find default sales user for assignment
    const salesUser = await prisma.user.findFirst({
      where: { organizationId: org.id, rol: { in: ['SALES', 'MANAGER', 'ADMIN'] }, activo: true },
    });

    const calc = await calculatePrice(body.items, body.descuentoPct, org.id);

    const numero = `OLCA-${dayjs().format('YYYY')}-${String(Date.now()).slice(-6)}`;

    const quote = await prisma.quote.create({
      data: {
        numero,
        organizationId: org.id,
        userId: salesUser?.id ?? (await prisma.user.findFirst({ where: { organizationId: org.id } }))!.id,
        clienteNombre: body.clienteNombre,
        clienteEmail: body.clienteEmail,
        clienteTelefono: body.clienteTelefono,
        clienteEmpresa: body.clienteEmpresa,
        clienteCuit: body.clienteCuit,
        clienteNotas: body.clienteNotas,
        notas: body.notas,
        subtotal: calc.subtotal,
        descuentoPct: calc.descuentoPct,
        descuentoMonto: calc.descuentoMonto,
        ivaRate: calc.ivaRate,
        ivaMonto: calc.ivaMonto,
        total: calc.total,
        vigenteHasta: dayjs().add(15, 'day').toDate(),
        items: {
          create: body.items.map((item, i) => {
            const calcItem = calc.items[i];
            return {
              productId: item.productId,
              productoNombre: calcItem.productoNombre,
              productoErpId: item.productId,
              cantidad: item.cantidad,
              fechaInicio: new Date(item.fechaInicio),
              fechaFin: new Date(item.fechaFin),
              diasAlquiler: calcItem.diasAlquiler,
              precioUnitario: calcItem.precioUnitario,
              subtotal: calcItem.subtotal,
            };
          }),
        },
      },
      include: { items: true },
    });

    // Async: send emails
    sendQuoteEmail(quote.id).catch(() => {});

    // Invalidate dashboard cache
    await cacheDelete(cacheKeys.dashboard(org.id));

    return reply.code(201).send({ success: true, data: quote });
  });

  // GET /api/quotes — listar (autenticado)
  app.get('/', {
    preHandler: [authenticate],
    schema: {
      tags: ['Quotes'],
      summary: 'Listar cotizaciones (paginado, filtrable)',
    },
  }, async (req, reply) => {
    const { organizationId } = req.user;
    const {
      page = 1, limit = 20, estado, search, desde, hasta,
    } = req.query as {
      page?: number; limit?: number; estado?: QuoteStatus;
      search?: string; desde?: string; hasta?: string;
    };

    const skip = (Number(page) - 1) * Number(limit);

    const where: Record<string, unknown> = { organizationId };
    if (estado) where.estado = estado;
    if (desde || hasta) {
      where.createdAt = {};
      if (desde) (where.createdAt as Record<string, unknown>).gte = new Date(desde);
      if (hasta) (where.createdAt as Record<string, unknown>).lte = new Date(hasta);
    }
    if (search) {
      (where as Record<string, unknown>).OR = [
        { clienteNombre: { contains: search, mode: 'insensitive' } },
        { clienteEmail: { contains: search, mode: 'insensitive' } },
        { numero: { contains: search, mode: 'insensitive' } },
        { clienteEmpresa: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.quote.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: { items: { include: { product: true } }, user: { select: { nombre: true, email: true } } },
      }),
      prisma.quote.count({ where }),
    ]);

    return reply.send({
      success: true,
      data,
      pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
    });
  });

  // GET /api/quotes/:id
  app.get('/:id', {
    preHandler: [authenticate],
    schema: { tags: ['Quotes'], summary: 'Detalle de cotización' },
  }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const { organizationId } = req.user;

    const quote = await prisma.quote.findFirst({
      where: { id, organizationId },
      include: {
        items: { include: { product: true } },
        user: { select: { nombre: true, email: true, apellido: true } },
        validadaPor: { select: { nombre: true, email: true } },
      },
    });

    if (!quote) return reply.code(404).send({ success: false, error: 'Cotización no encontrada' });
    return reply.send({ success: true, data: quote });
  });

  // GET /api/quotes/public/:token — sin auth
  app.get('/public/:token', {
    schema: { tags: ['Quotes'], summary: 'Ver cotización por token público' },
  }, async (req, reply) => {
    const { token } = req.params as { token: string };
    const quote = await prisma.quote.findUnique({
      where: { tokenPublico: token },
      include: { items: { include: { product: true } } },
    });
    if (!quote) return reply.code(404).send({ success: false, error: 'Cotización no encontrada' });
    return reply.send({ success: true, data: quote });
  });

  // POST /api/quotes/:id/validate
  app.post('/:id/validate', {
    preHandler: [authenticate, requireRole(Role.ADMIN, Role.MANAGER, Role.SALES)],
    schema: { tags: ['Quotes'], summary: 'Validar cotización' },
  }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const { organizationId, userId } = req.user;

    const quote = await prisma.quote.update({
      where: { id, organizationId },
      data: { estado: QuoteStatus.APROBADA, validadaPorId: userId, validadaEn: new Date() },
    });

    await cacheDelete(cacheKeys.dashboard(organizationId));
    return reply.send({ success: true, data: quote });
  });

  // POST /api/quotes/:id/reject
  app.post('/:id/reject', {
    preHandler: [authenticate, requireRole(Role.ADMIN, Role.MANAGER, Role.SALES)],
    schema: { tags: ['Quotes'], summary: 'Rechazar cotización' },
  }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const { organizationId, userId } = req.user;
    const body = req.body as { motivo?: string };

    const quote = await prisma.quote.update({
      where: { id, organizationId },
      data: {
        estado: QuoteStatus.RECHAZADA,
        validadaPorId: userId,
        validadaEn: new Date(),
        rechazadaMotivo: body.motivo,
      },
    });

    await cacheDelete(cacheKeys.dashboard(organizationId));
    return reply.send({ success: true, data: quote });
  });

  // POST /api/quotes/:id/convert
  app.post('/:id/convert', {
    preHandler: [authenticate, requireRole(Role.ADMIN, Role.MANAGER)],
    schema: { tags: ['Quotes'], summary: 'Convertir cotización a venta' },
  }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const { organizationId } = req.user;

    const quote = await prisma.quote.update({
      where: { id, organizationId },
      data: { estado: QuoteStatus.CONVERTIDA, convertidaVenta: true },
    });

    await cacheDelete(cacheKeys.dashboard(organizationId));
    return reply.send({ success: true, data: quote });
  });
}
