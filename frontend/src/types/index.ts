export interface Product {
  id: string;
  erpId: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  subcategoria?: string;
  precioBase: number;
  stock: number;
  imagen?: string;
  especificaciones?: Record<string, string | number>;
  marca?: string;
  modelo?: string;
  anio?: number;
}

export interface QuoteItem {
  productId: string;
  product?: Product;
  cantidad: number;
  fechaInicio: string;
  fechaFin: string;
  diasAlquiler?: number;
  precioUnitario?: number;
  subtotal?: number;
  productoNombre?: string;
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

export interface CreateQuotePayload {
  clienteNombre: string;
  clienteEmail: string;
  clienteTelefono?: string;
  clienteEmpresa?: string;
  clienteCuit?: string;
  clienteNotas?: string;
  items: { productId: string; cantidad: number; fechaInicio: string; fechaFin: string }[];
  descuentoPct?: number;
  notas?: string;
  orgSlug: string;
}

export interface Quote {
  id: string;
  numero: string;
  tokenPublico: string;
  clienteNombre: string;
  clienteEmail: string;
  clienteTelefono?: string;
  clienteEmpresa?: string;
  estado: QuoteStatus;
  subtotal: number;
  descuentoPct: number;
  descuentoMonto: number;
  ivaRate: number;
  ivaMonto: number;
  total: number;
  moneda: string;
  items: QuoteItem[];
  createdAt: string;
  updatedAt: string;
  vigenteHasta?: string;
  notas?: string;
  user?: { nombre: string; email: string };
}

export type QuoteStatus = 'PENDIENTE' | 'REVISANDO' | 'APROBADA' | 'RECHAZADA' | 'CONVERTIDA' | 'EXPIRADA';

export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido?: string;
  rol: Role;
  avatar?: string;
  organizacion: { id: string; nombre: string; slug: string; logo?: string };
}

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'SALES' | 'VIEWER' | 'CLIENT';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

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

export interface PaginatedResponse<T> {
  data: T[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}
