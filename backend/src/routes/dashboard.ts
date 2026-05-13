import { FastifyInstance } from 'fastify';
import dayjs from 'dayjs';
import { prisma } from '../config/database';
import { cacheGet, cacheSet, cacheKeys, CACHE_TTL } from '../config/redis';
import { authenticate } from '../middleware/auth';
import { DashboardStats } from '../types';
import { QuoteStatus } from '@prisma/client';

export default async function dashboardRoutes(app: FastifyInstance) {

  // GET /api/dashboard — overview stats
  app.get('/', {
    preHandler: [authenticate],
    schema: { tags: ['Dashboard'], summary: 'Estadísticas generales' },
  }, async (req, reply) => {
    const { organizationId } = req.user;
    const cacheKey = cacheKeys.dashboard(organizationId);

    const cached = await cacheGet<DashboardStats>(cacheKey);
    if (cached) return reply.send({ success: true, data: cached });

    const now = dayjs();
    const inicioMes = now.startOf('month').toDate();

    const [
      totalCotizaciones,
      pendientes,
      aprobadas,
      convertidas,
      ingresosTotales,
      ingresosEsteMes,
      productosActivos,
      ultimoSync,
    ] = await Promise.all([
      prisma.quote.count({ where: { organizationId } }),
      prisma.quote.count({ where: { organizationId, estado: QuoteStatus.PENDIENTE } }),
      prisma.quote.count({ where: { organizationId, estado: QuoteStatus.APROBADA } }),
      prisma.quote.count({ where: { organizationId, estado: QuoteStatus.CONVERTIDA } }),
      prisma.quote.aggregate({ where: { organizationId, convertidaVenta: true }, _sum: { total: true } }),
      prisma.quote.aggregate({
        where: { organizationId, convertidaVenta: true, createdAt: { gte: inicioMes } },
        _sum: { total: true },
      }),
      prisma.product.count({ where: { organizationId, activo: true } }),
      prisma.eRPConfig.findUnique({ where: { organizationId }, select: { ultimoSync: true } }),
    ]);

    const stats: DashboardStats = {
      totalCotizaciones,
      cotizacionesPendientes: pendientes,
      cotizacionesAprobadas: aprobadas,
      cotizacionesConvertidas: convertidas,
      tasaConversion: totalCotizaciones > 0 ? (convertidas / totalCotizaciones) * 100 : 0,
      ingresosTotales: ingresosTotales._sum.total ?? 0,
      ingresosEsteMes: ingresosEsteMes._sum.total ?? 0,
      productosActivos,
      ultimaSincronizacion: ultimoSync?.ultimoSync?.toISOString() ?? null,
    };

    await cacheSet(cacheKey, stats, CACHE_TTL.DASHBOARD);
    return reply.send({ success: true, data: stats });
  });

  // GET /api/dashboard/charts — datos para gráficos
  app.get('/charts', {
    preHandler: [authenticate],
    schema: { tags: ['Dashboard'], summary: 'Datos para gráficos (últimos 30 días)' },
  }, async (req, reply) => {
    const { organizationId } = req.user;
    const desde = dayjs().subtract(30, 'day').startOf('day').toDate();

    const quotes = await prisma.quote.findMany({
      where: { organizationId, createdAt: { gte: desde } },
      select: { createdAt: true, total: true, estado: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by day
    const byDay: Record<string, { date: string; count: number; total: number }> = {};
    for (let i = 30; i >= 0; i--) {
      const day = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
      byDay[day] = { date: day, count: 0, total: 0 };
    }

    for (const q of quotes) {
      const day = dayjs(q.createdAt).format('YYYY-MM-DD');
      if (byDay[day]) {
        byDay[day].count++;
        byDay[day].total += q.total;
      }
    }

    // Status distribution
    const statusDist = await prisma.quote.groupBy({
      by: ['estado'],
      where: { organizationId },
      _count: { estado: true },
    });

    return reply.send({
      success: true,
      data: {
        cotizacionesPorDia: Object.values(byDay),
        distribucionEstados: statusDist.map((s) => ({ estado: s.estado, count: s._count.estado })),
      },
    });
  });

  // GET /api/dashboard/recent — últimas 10 cotizaciones
  app.get('/recent', {
    preHandler: [authenticate],
    schema: { tags: ['Dashboard'], summary: 'Últimas cotizaciones' },
  }, async (req, reply) => {
    const { organizationId } = req.user;
    const quotes = await prisma.quote.findMany({
      where: { organizationId },
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, numero: true, clienteNombre: true, clienteEmpresa: true,
        estado: true, total: true, createdAt: true,
        user: { select: { nombre: true } },
      },
    });
    return reply.send({ success: true, data: quotes });
  });
}
