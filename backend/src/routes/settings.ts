import { FastifyInstance } from 'fastify';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import { JWTPayload } from '../types';

export default async function settingsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);

  // GET /api/settings/email
  app.get('/email', async (req, reply) => {
    const { organizationId } = req.user as JWTPayload;

    const config = await prisma.emailConfig.findUnique({
      where: { organizationId },
    });

    return reply.send({ success: true, data: config });
  });

  // POST /api/settings/email
  app.post('/email', async (req, reply) => {
    const { organizationId } = req.user as JWTPayload;
    const body = req.body as any;

    const config = await prisma.emailConfig.upsert({
      where: { organizationId },
      update: {
        host: body.host,
        port: parseInt(body.port),
        secure: body.secure,
        user: body.user,
        pass: body.pass,
        fromName: body.fromName,
        fromEmail: body.fromEmail,
      },
      create: {
        organizationId,
        host: body.host,
        port: parseInt(body.port),
        secure: body.secure,
        user: body.user,
        pass: body.pass,
        fromName: body.fromName,
        fromEmail: body.fromEmail,
      },
    });

    return reply.send({ success: true, data: config });
  });
}
