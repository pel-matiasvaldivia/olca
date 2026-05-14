import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(amount: number, currency = 'ARS'): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function diffDays(start: string, end: string): number {
  if (!start || !end) return 0;
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (isNaN(s) || isNaN(e)) return 0;
  return Math.max(Math.round((e - s) / 86400000), 0);
}

export const STATUS_LABELS: Record<string, string> = {
  PENDIENTE:  'Pendiente',
  REVISANDO:  'En revisión',
  APROBADA:   'Aprobada',
  RECHAZADA:  'Rechazada',
  CONVERTIDA: 'Convertida',
  EXPIRADA:   'Expirada',
};

export const STATUS_CLASS: Record<string, string> = {
  PENDIENTE:  'badge-pending',
  REVISANDO:  'badge-pending',
  APROBADA:   'badge-approved',
  RECHAZADA:  'badge-rejected',
  CONVERTIDA: 'badge-converted',
  EXPIRADA:   'badge-expired',
};
