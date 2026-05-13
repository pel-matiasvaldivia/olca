import { Role, QuoteStatus, ERPType } from '@prisma/client';

export { Role, QuoteStatus, ERPType };

// ── Auth ─────────────────────────────────────────────

export interface JWTPayload {
  userId: string;
  organizationId: string;
  rol: Role;
  email: string;
}

// ── API Response ─────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ── Quote ─────────────────────────────────────────────

export interface CreateQuoteBody {
  clienteNombre: string;
  clienteEmail: string;
  clienteTelefono?: string;
  clienteEmpresa?: string;
  clienteCuit?: string;
  clienteNotas?: string;
  items: CreateQuoteItemBody[];
  descuentoPct?: number;
  notas?: string;
}

export interface CreateQuoteItemBody {
  productId: string;
  cantidad: number;
  fechaInicio: string;
  fechaFin: string;
}

export interface CalculatePriceBody {
  items: CreateQuoteItemBody[];
  descuentoPct?: number;
}

export interface PriceCalculation {
  items: {
    productId: string;
    productoNombre: string;
    cantidad: number;
    diasAlquiler: number;
    precioUnitario: number;
    subtotal: number;
  }[];
  subtotal: number;
  descuentoPct: number;
  descuentoMonto: number;
  ivaRate: number;
  ivaMonto: number;
  total: number;
}

// ── ERP / Product ─────────────────────────────────────

export interface ProductDTO {
  id: string;
  erpId: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  subcategoria?: string;
  precioBase: number;
  stock: number;
  imagen?: string;
  especificaciones?: Record<string, unknown>;
  marca?: string;
  modelo?: string;
  anio?: number;
}

// ── Dashboard ─────────────────────────────────────────

export interface DashboardStats {
  totalCotizaciones: number;
  cotizacionesPendientes: number;
  cotizacionesAprobadas: number;
  cotizacionesConvertidas: number;
  tasaConversion: number;
  ingresosTotales: number;
  ingresosEsteMes: number;
  productosActivos: number;
  ultimaSincronizacion: string | null;
}
