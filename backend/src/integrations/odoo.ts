import axios, { AxiosInstance } from 'axios';
import { ProductDTO } from '../types';
import { logger } from '../config/logger';

interface OdooConfig {
  url: string;
  db: string;
  username: string;
  apiKey: string;
}

interface OdooProduct {
  id: number;
  name: string;
  description_sale?: string;
  categ_id: [number, string];
  list_price: number;
  qty_available: number;
  image_1920?: string;
  default_code?: string;
  active: boolean;
  [key: string]: unknown;
}

export class OdooConnector {
  private client: AxiosInstance;
  private config: OdooConfig;
  private uid: number | null = null;

  constructor(config: OdooConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.url,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ── Authenticate with Odoo ────────────────────────────

  async authenticate(): Promise<number> {
    const response = await this.client.post('/web/session/authenticate', {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        db: this.config.db,
        login: this.config.username,
        password: this.config.apiKey,
      },
    });

    const uid = response.data?.result?.uid;
    if (!uid) throw new Error('Odoo authentication failed');
    this.uid = uid;
    logger.info(`✅ Odoo authenticated (uid=${uid})`);
    return uid;
  }

  // ── Call Odoo RPC ─────────────────────────────────────

  private async rpc<T>(model: string, method: string, args: unknown[], kwargs: Record<string, unknown> = {}): Promise<T> {
    if (!this.uid) await this.authenticate();

    const response = await this.client.post('/web/dataset/call_kw', {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        model,
        method,
        args,
        kwargs: {
          ...kwargs,
          context: { lang: 'es_AR', tz: 'America/Argentina/Buenos_Aires' },
        },
      },
    });

    if (response.data?.error) {
      throw new Error(`Odoo RPC error: ${JSON.stringify(response.data.error)}`);
    }

    return response.data?.result as T;
  }

  // ── Get Products from Odoo ────────────────────────────

  async getProducts(limit = 500, offset = 0): Promise<ProductDTO[]> {
    const fields = [
      'id', 'name', 'description_sale', 'categ_id', 'list_price',
      'qty_available', 'image_1920', 'default_code', 'active',
    ];

    const domain = [['active', '=', true], ['sale_ok', '=', true]];

    const odooProducts = await this.rpc<OdooProduct[]>('product.template', 'search_read', [domain], {
      fields,
      limit,
      offset,
      order: 'name asc',
    });

    return odooProducts.map(this.mapProduct);
  }

  // ── Get Single Product ────────────────────────────────

  async getProductById(erpId: string): Promise<ProductDTO | null> {
    const id = parseInt(erpId);
    if (isNaN(id)) return null;

    const products = await this.rpc<OdooProduct[]>('product.template', 'search_read', [
      [['id', '=', id]],
    ], {
      fields: ['id', 'name', 'description_sale', 'categ_id', 'list_price', 'qty_available', 'image_1920', 'active'],
      limit: 1,
    });

    return products[0] ? this.mapProduct(products[0]) : null;
  }

  // ── Map Odoo product → DTO ────────────────────────────

  private mapProduct(p: OdooProduct): ProductDTO {
    return {
      id: `odoo-${p.id}`,
      erpId: String(p.id),
      nombre: p.name,
      descripcion: p.description_sale,
      categoria: Array.isArray(p.categ_id) ? p.categ_id[1] : 'Sin categoría',
      precioBase: p.list_price,
      stock: Math.floor(p.qty_available),
      imagen: p.image_1920
        ? `data:image/png;base64,${p.image_1920}`
        : undefined,
    };
  }

  // ── Webhook setup (optional) ──────────────────────────

  async registerWebhook(endpoint: string): Promise<void> {
    logger.info(`Odoo webhook registration endpoint: ${endpoint} (manual setup required in Odoo)`);
  }
}

// ── Factory function ──────────────────────────────────

export function createOdooConnector(config: OdooConfig): OdooConnector {
  return new OdooConnector(config);
}
