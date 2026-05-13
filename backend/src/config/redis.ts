import Redis from 'ioredis';
import { logger } from './logger';

export const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 50, 2000),
  lazyConnect: false,
});

redis.on('connect', () => logger.info('✅ Redis connected'));
redis.on('error', (err) => logger.error('❌ Redis error:', err));

// ── Cache Helpers ─────────────────────────────────────

export const CACHE_TTL = {
  PRODUCTS: 60 * 60,        // 1 hora
  PRODUCT_DETAIL: 60 * 5,   // 5 minutos
  DASHBOARD: 60 * 2,        // 2 minutos
} as const;

export async function cacheGet<T>(key: string): Promise<T | null> {
  const data = await redis.get(key);
  return data ? (JSON.parse(data) as T) : null;
}

export async function cacheSet(key: string, value: unknown, ttl: number): Promise<void> {
  await redis.setex(key, ttl, JSON.stringify(value));
}

export async function cacheDelete(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) await redis.del(...keys);
}

export const cacheKeys = {
  products: (orgId: string) => `org:${orgId}:products`,
  productById: (orgId: string, id: string) => `org:${orgId}:product:${id}`,
  dashboard: (orgId: string) => `org:${orgId}:dashboard`,
  quotes: (orgId: string) => `org:${orgId}:quotes:*`,
};
