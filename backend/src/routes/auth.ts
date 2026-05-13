import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import { JWTPayload } from '../types';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  organizationSlug: z.string().min(1, 'Slug de organización requerido'),
});

const refreshSchema = z.object({
  refreshToken: z.string(),
});

function generateTokens(payload: JWTPayload) {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

export default async function authRoutes(app: FastifyInstance) {
  // POST /api/auth/login
  app.post('/login', {
    schema: {
      tags: ['Auth'],
      summary: 'Login de usuario',
      body: {
        type: 'object',
        required: ['email', 'password', 'organizationSlug'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
          organizationSlug: { type: 'string' },
        },
      },
    },
  }, async (req, reply) => {
    const body = loginSchema.parse(req.body);

    // Find organization
    const org = await prisma.organization.findUnique({
      where: { slug: body.organizationSlug, activa: true },
    });
    if (!org) {
      return reply.code(404).send({ success: false, error: 'Organización no encontrada' });
    }

    // Find user within org
    const user = await prisma.user.findFirst({
      where: { email: body.email, organizationId: org.id, activo: true },
    });
    if (!user) {
      return reply.code(401).send({ success: false, error: 'Credenciales inválidas' });
    }

    const validPassword = await bcrypt.compare(body.password, user.password);
    if (!validPassword) {
      return reply.code(401).send({ success: false, error: 'Credenciales inválidas' });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { ultimoLogin: new Date() },
    });

    const payload: JWTPayload = {
      userId: user.id,
      organizationId: org.id,
      rol: user.rol,
      email: user.email,
    };

    const tokens = generateTokens(payload);

    return reply.send({
      success: true,
      data: {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          nombre: user.nombre,
          apellido: user.apellido,
          rol: user.rol,
          avatar: user.avatar,
          organizacion: {
            id: org.id,
            nombre: org.nombre,
            slug: org.slug,
            logo: org.logo,
          },
        },
      },
    });
  });

  // POST /api/auth/refresh
  app.post('/refresh', {
    schema: { tags: ['Auth'], summary: 'Renovar access token' },
  }, async (req, reply) => {
    const body = refreshSchema.parse(req.body);
    try {
      const payload = jwt.verify(body.refreshToken, process.env.JWT_REFRESH_SECRET!) as JWTPayload;
      const tokens = generateTokens({
        userId: payload.userId,
        organizationId: payload.organizationId,
        rol: payload.rol,
        email: payload.email,
      });
      return reply.send({ success: true, data: tokens });
    } catch {
      return reply.code(401).send({ success: false, error: 'Refresh token inválido' });
    }
  });

  // GET /api/auth/me
  app.get('/me', {
    preHandler: [authenticate],
    schema: { tags: ['Auth'], summary: 'Obtener usuario actual' },
  }, async (req, reply) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true, email: true, nombre: true, apellido: true,
        rol: true, avatar: true, telefono: true,
        organization: { select: { id: true, nombre: true, slug: true, logo: true } },
      },
    });
    return reply.send({ success: true, data: user });
  });

  // POST /api/auth/logout
  app.post('/logout', {
    preHandler: [authenticate],
    schema: { tags: ['Auth'], summary: 'Logout' },
  }, async (_req, reply) => {
    // Stateless JWT — en producción agregar token blacklist con Redis
    return reply.send({ success: true, message: 'Sesión cerrada' });
  });
}
