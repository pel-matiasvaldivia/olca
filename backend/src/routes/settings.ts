import { FastifyInstance } from 'fastify';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import { JWTPayload } from '../types';
import { sendTestEmail } from '../jobs/sendEmails';

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

  // POST /api/settings/email/test
  app.post('/email/test', async (req, reply) => {
    const body = req.body as any;

    try {
      await sendTestEmail(body, body.testEmail);
      return reply.send({ success: true, message: 'Email de prueba enviado exitosamente' });
    } catch (err: any) {
      return reply.status(500).send({ 
        success: false, 
        message: 'Error al enviar email de prueba',
        error: err.message
      });
    }
  });
}
