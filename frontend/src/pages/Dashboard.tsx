import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, FileText, BarChart2, LogOut, Menu, X, RefreshCw
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi, productsApi } from '../services/api';
import { DashboardStats } from '../types';
import { formatMoney } from '../utils/cn';
import QuotesTable from '../components/Dashboard/QuotesTable';
import Analytics from '../components/Dashboard/Analytics';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/dashboard/quotes', icon: FileText, label: 'Cotizaciones' },
  { to: '/dashboard/analytics', icon: BarChart2, label: 'Analytics' },
];

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className={`card p-5 ${accent ? 'border-brand-400/30 bg-brand-400/5' : ''}`}>
      <p className="text-xs text-dark-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-black ${accent ? 'text-brand-400' : 'text-dark-50'}`}>{value}</p>
      {sub && <p className="text-xs text-dark-500 mt-1">{sub}</p>}
    </div>
  );
}

function Overview() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: () => dashboardApi.stats() });
  const { data: recentData } = useQuery({ queryKey: ['dashboard-recent'], queryFn: () => dashboardApi.recent() });

  const syncMutation = useMutation({
    mutationFn: () => productsApi.sync(),
    onSuccess: () => {
      toast.success('Sincronización completada');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: () => toast.error('Error en la sincronización'),
  });

  const stats: DashboardStats | undefined = data?.data?.data;
  const recent = recentData?.data?.data ?? [];

  return (
    <div className="animate-in space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-dark-50">Dashboard</h1>
          <p className="text-dark-400 text-sm mt-1">Vista general de tu operación</p>
        </div>
        <button onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending}
          className="btn-secondary gap-2">
          <RefreshCw className={`w-4 h-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
          Sincronizar ERP
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-3 bg-dark-700 rounded mb-3 w-24" />
              <div className="h-7 bg-dark-600 rounded w-16" />
            </div>
          ))}
        </div>
      ) : stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total cotizaciones" value={stats.totalCotizaciones} />
          <StatCard label="Pendientes" value={stats.cotizacionesPendientes} sub="Requieren revisión" />
          <StatCard label="Conversión" value={`${stats.tasaConversion.toFixed(1)}%`} accent />
          <StatCard label="Ingresos este mes" value={formatMoney(stats.ingresosEsteMes)} sub="Convertidas a venta" accent />
        </div>
      )}

      {/* Recent quotes */}
      {recent.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-dark-100">Últimas cotizaciones</h2>
            <Link to="/dashboard/quotes" className="text-sm text-brand-400 hover:underline">Ver todas →</Link>
          </div>
          <div className="space-y-2">
            {recent.map((q: { id: string; numero: string; clienteNombre: string; clienteEmpresa?: string; estado: string; total: number; createdAt: string }) => (
              <div key={q.id} className="flex items-center justify-between py-2.5 border-b border-dark-700 last:border-0">
                <div>
                  <span className="text-sm font-semibold text-dark-100">{q.numero}</span>
                  <span className="text-dark-400 text-xs ml-2">— {q.clienteNombre}{q.clienteEmpresa ? ` (${q.clienteEmpresa})` : ''}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge badge-${q.estado.toLowerCase()}`}>{q.estado}</span>
                  <span className="text-brand-400 font-semibold text-sm">{formatMoney(q.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const Sidebar = () => (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-dark-900 border-r border-dark-700 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
      <div className="h-16 flex items-center px-6 border-b border-dark-700">
        <span className="text-lg font-black tracking-widest gradient-text">OLCA RENTAL</span>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {NAV.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link key={to} to={to} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-brand-400/10 text-brand-400 border border-brand-400/20'
                  : 'text-dark-400 hover:text-dark-100 hover:bg-dark-800'
              }`}>
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-dark-700">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 rounded-full bg-brand-400/20 flex items-center justify-center text-brand-400 font-bold text-sm">
            {user?.nombre?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-dark-100 truncate">{user?.nombre}</p>
            <p className="text-xs text-dark-500 truncate">{user?.rol}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-ghost w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20">
          <LogOut className="w-4 h-4" /> Cerrar sesión
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-dark-950 flex">
      <Sidebar />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 glass border-b border-dark-700/50 flex items-center px-4 md:px-8 gap-4 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden btn-ghost p-2">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex-1" />
          <Link to="/cotizar" target="_blank" className="btn-primary text-xs py-2 px-4">
            + Nueva cotización
          </Link>
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-8">
          <Routes>
            <Route index element={<Overview />} />
            <Route path="quotes" element={<QuotesTable />} />
            <Route path="analytics" element={<Analytics />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
