import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Loader2 } from 'lucide-react';
import { dashboardApi } from '../../services/api';
import { formatMoney } from '../../utils/cn';

const COLORS = ['#e8b84b', '#f5d78e', '#b8821d', '#8f6015', '#555570'];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass px-3 py-2 rounded-lg text-xs">
      <p className="text-dark-300 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-brand-400 font-semibold">{p.name}: {typeof p.value === 'number' && p.value > 1000 ? formatMoney(p.value) : p.value}</p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.stats(),
  });

  const { data: chartsData, isLoading: chartsLoading } = useQuery({
    queryKey: ['dashboard-charts'],
    queryFn: () => dashboardApi.charts(),
  });

  const stats = statsData?.data?.data;
  const charts = chartsData?.data?.data;

  const isLoading = statsLoading || chartsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
      </div>
    );
  }

  const dailyData = charts?.cotizacionesPorDia ?? [];
  const statusData = charts?.distribucionEstados?.map((s: { estado: string; count: number }) => ({
    name: s.estado,
    value: s.count,
  })) ?? [];

  return (
    <div className="animate-in space-y-8">
      <div>
        <h1 className="text-2xl font-black text-dark-50">Analytics</h1>
        <p className="text-dark-400 text-sm mt-1">Métricas de los últimos 30 días</p>
      </div>

      {/* KPI cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total cotizaciones', value: stats.totalCotizaciones, format: 'number' },
            { label: 'Tasa de conversión', value: `${stats.tasaConversion.toFixed(1)}%`, format: 'string' },
            { label: 'Ingresos totales', value: formatMoney(stats.ingresosTotales), format: 'string' },
            { label: 'Productos activos', value: stats.productosActivos, format: 'number' },
          ].map((kpi) => (
            <div key={kpi.label} className="card p-5">
              <p className="text-xs text-dark-400 uppercase tracking-wider mb-2">{kpi.label}</p>
              <p className="text-2xl font-black text-brand-400">{kpi.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Cotizaciones por día */}
        <div className="card p-6">
          <h2 className="text-base font-bold text-dark-100 mb-6">Cotizaciones por día</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e38" />
              <XAxis dataKey="date" tick={{ fill: '#707090', fontSize: 10 }}
                tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fill: '#707090', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Cotizaciones" fill="#e8b84b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Ingresos por día */}
        <div className="card p-6">
          <h2 className="text-base font-bold text-dark-100 mb-6">Ingresos diarios (ARS)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dailyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e38" />
              <XAxis dataKey="date" tick={{ fill: '#707090', fontSize: 10 }}
                tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fill: '#707090', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="total" name="Ingresos" stroke="#e8b84b"
                strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#e8b84b' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Estado distribución */}
        <div className="card p-6">
          <h2 className="text-base font-bold text-dark-100 mb-6">Distribución por estado</h2>
          {statusData.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                    dataKey="value" paddingAngle={3}>
                    {statusData.map((_: unknown, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {statusData.map((s: { name: string; value: number }, i: number) => (
                  <div key={s.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-dark-300">{s.name}</span>
                    </div>
                    <span className="text-dark-100 font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-dark-500 text-sm">
              Sin datos disponibles
            </div>
          )}
        </div>

        {/* Summary stats */}
        {stats && (
          <div className="card p-6">
            <h2 className="text-base font-bold text-dark-100 mb-6">Resumen operativo</h2>
            <div className="space-y-4">
              {[
                { label: 'Pendientes de revisión', value: stats.cotizacionesPendientes, color: 'text-amber-400' },
                { label: 'Aprobadas', value: stats.cotizacionesAprobadas, color: 'text-green-400' },
                { label: 'Convertidas a venta', value: stats.cotizacionesConvertidas, color: 'text-brand-400' },
                { label: 'Ingresos este mes', value: formatMoney(stats.ingresosEsteMes), color: 'text-brand-400' },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center py-2 border-b border-dark-700/50 last:border-0">
                  <span className="text-sm text-dark-400">{row.label}</span>
                  <span className={`text-sm font-bold ${row.color}`}>{row.value}</span>
                </div>
              ))}
              {stats.ultimaSincronizacion && (
                <div className="text-xs text-dark-600 pt-2">
                  Último sync ERP: {new Date(stats.ultimaSincronizacion).toLocaleString('es-AR')}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
