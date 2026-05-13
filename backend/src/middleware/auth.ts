import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { JWTPayload } from '../types';

declare module 'fastify' {
  interface FastifyRequest {
    user: JWTPayload;
  }
}

// ── Verify JWT ────────────────────────────────────────

export async function authenticate(req: FastifyRequest, reply: FastifyReply) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return reply.code(401).send({ success: false, error: 'Token requerido' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    req.user = payload;
  } catch {
    return reply.code(401).send({ success: false, error: 'Token inválido o expirado' });
  }
}

// ── RBAC ─────────────────────────────────────────────

export function requireRole(...roles: Role[]) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    if (!req.user) {
      return reply.code(401).send({ success: false, error: 'No autenticado' });
    }
    if (!roles.includes(req.user.rol)) {
      return reply.code(403).send({
        success: false,
        error: `Acceso denegado. Roles requeridos: ${roles.join(', ')}`,
      });
    }
  };
}

// ── Tenant Guard ──────────────────────────────────────
// Ensures the requested resource belongs to the user's org

export function isSameTenant(userOrgId: string, resourceOrgId: string): boolean {
  return userOrgId === resourceOrgId;
}
