import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import websocket from '@fastify/websocket';
import { logger } from './config/logger';
import { prisma } from './config/database';
import { redis } from './config/redis';

// Routes
import authRoutes from './routes/auth';
import erpRoutes from './routes/erp';
import quoteRoutes from './routes/quotes';
import dashboardRoutes from './routes/dashboard';

// Jobs
import { startSyncJob } from './jobs/syncERPProducts';

const app = Fastify({
  logger: false, // usamos winston
  trustProxy: true,
});

async function bootstrap() {
  // ── Plugins ──────────────────────────────────────────
  await app.register(helmet, {
    contentSecurityPolicy: false,
  });

  await app.register(cors, {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  await app.register(websocket);

  await app.register(swagger, {
    openapi: {
      info: {
        title: 'OLCA Rental API',
        description: 'API para la plataforma de cotización OLCA Rental',
        version: '1.0.0',
      },
      servers: [{ url: `http://localhost:${process.env.PORT || 3001}` }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/api/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });

  // ── Routes ───────────────────────────────────────────
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(erpRoutes, { prefix: '/api/erp' });
  await app.register(quoteRoutes, { prefix: '/api/quotes' });
  await app.register(dashboardRoutes, { prefix: '/api/dashboard' });

  // ── Health check ──────────────────────────────────────
  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  }));

  // ── Graceful shutdown ────────────────────────────────
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    await app.close();
    await prisma.$disconnect();
    await redis.quit();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // ── Start ─────────────────────────────────────────────
  const port = parseInt(process.env.PORT || '3001');
  const host = process.env.HOST || '0.0.0.0';

  await app.listen({ port, host });
  logger.info(`🚀 OLCA Backend running on http://${host}:${port}`);
  logger.info(`📚 API Docs: http://${host}:${port}/api/docs`);

  // ── Background Jobs ───────────────────────────────────
  startSyncJob();
  logger.info('⚙️  Background jobs started');
}

bootstrap().catch((err) => {
  logger.error('Fatal error starting server:', err);
  process.exit(1);
});
