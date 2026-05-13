import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Check, X, TrendingUp, Eye, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { quotesApi } from '../../services/api';
import { Quote } from '../../types';
import { formatMoney, formatDate, STATUS_LABELS, STATUS_CLASS } from '../../utils/cn';
import toast from 'react-hot-toast';

const STATUSES = [
  { value: '', label: 'Todos' },
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'APROBADA', label: 'Aprobada' },
  { value: 'RECHAZADA', label: 'Rechazada' },
  { value: 'CONVERTIDA', label: 'Convertida' },
];

export default function QuotesTable() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const [selected, setSelected] = useState<Quote | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['quotes', page, search, estado],
    queryFn: () => quotesApi.list({ page, limit: 15, search: search || undefined, estado: estado || undefined }),
  });

  const quotes: Quote[] = data?.data?.data ?? [];
  const pagination = data?.data?.pagination;

  const validate = useMutation({
    mutationFn: (id: string) => quotesApi.validate(id),
    onSuccess: () => { toast.success('Cotización aprobada'); qc.invalidateQueries({ queryKey: ['quotes'] }); setSelected(null); },
    onError: () => toast.error('Error al aprobar'),
  });

  const reject = useMutation({
    mutationFn: (id: string) => quotesApi.reject(id),
    onSuccess: () => { toast.success('Cotización rechazada'); qc.invalidateQueries({ queryKey: ['quotes'] }); setSelected(null); },
    onError: () => toast.error('Error al rechazar'),
  });

  const convert = useMutation({
    mutationFn: (id: string) => quotesApi.convert(id),
    onSuccess: () => { toast.success('¡Convertida a venta!'); qc.invalidateQueries({ queryKey: ['quotes'] }); setSelected(null); },
    onError: () => toast.error('Error al convertir'),
  });

  return (
    <div className="animate-in space-y-6">
      <div>
        <h1 className="text-2xl font-black text-dark-50">Cotizaciones</h1>
        <p className="text-dark-400 text-sm mt-1">{pagination?.total ?? 0} en total</p>
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input pl-10" placeholder="Buscar cliente, empresa, número..." />
        </div>
        <select value={estado} onChange={(e) => { setEstado(e.target.value); setPage(1); }} className="input sm:w-40">
          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700 bg-dark-800/50">
                {['Número', 'Cliente', 'Empresa', 'Total', 'Estado', 'Fecha', 'Acciones'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="py-16 text-center">
                  <Loader2 className="w-6 h-6 text-brand-400 animate-spin mx-auto" />
                </td></tr>
              ) : quotes.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center text-dark-500 text-sm">No hay cotizaciones</td></tr>
              ) : quotes.map((q) => (
                <tr key={q.id} className="border-b border-dark-700/50 hover:bg-dark-800/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-semibold text-brand-400">{q.numero}</td>
                  <td className="px-4 py-3 text-sm text-dark-100">{q.clienteNombre}</td>
                  <td className="px-4 py-3 text-sm text-dark-400">{q.clienteEmpresa || '—'}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-dark-100">{formatMoney(q.total)}</td>
                  <td className="px-4 py-3">
                    <span className={STATUS_CLASS[q.estado]}>{STATUS_LABELS[q.estado]}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-dark-400">{formatDate(q.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setSelected(q)} title="Ver" className="btn-ghost p-1.5 hover:text-brand-400"><Eye className="w-4 h-4" /></button>
                      {q.estado === 'PENDIENTE' && <>
                        <button onClick={() => validate.mutate(q.id)} title="Aprobar" className="btn-ghost p-1.5 hover:text-green-400"><Check className="w-4 h-4" /></button>
                        <button onClick={() => reject.mutate(q.id)} title="Rechazar" className="btn-ghost p-1.5 hover:text-red-400"><X className="w-4 h-4" /></button>
                      </>}
                      {q.estado === 'APROBADA' && (
                        <button onClick={() => convert.mutate(q.id)} title="Convertir" className="btn-ghost p-1.5 hover:text-brand-400"><TrendingUp className="w-4 h-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-dark-700">
            <span className="text-sm text-dark-400">Pág. {page} de {pagination.totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost p-2"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} className="btn-ghost p-2"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="card p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-bold text-dark-50">{selected.numero}</h2>
                <span className={STATUS_CLASS[selected.estado]}>{STATUS_LABELS[selected.estado]}</span>
              </div>
              <button onClick={() => setSelected(null)} className="btn-ghost p-1"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm mb-4">
              <div><span className="text-dark-500">Cliente: </span><span className="text-dark-100">{selected.clienteNombre}</span></div>
              <div><span className="text-dark-500">Email: </span><span className="text-dark-100">{selected.clienteEmail}</span></div>
              {selected.clienteEmpresa && <div><span className="text-dark-500">Empresa: </span><span className="text-dark-100">{selected.clienteEmpresa}</span></div>}
              {selected.clienteTelefono && <div><span className="text-dark-500">Tel: </span><span className="text-dark-100">{selected.clienteTelefono}</span></div>}
            </div>
            <div className="bg-dark-700/50 rounded-xl p-4 mb-4 space-y-2">
              {(selected.items ?? []).map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-dark-200">{item.productoNombre ?? item.product?.nombre} × {item.cantidad}</span>
                  <span className="text-brand-400">{formatMoney(item.subtotal ?? 0)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold pt-2 border-t border-dark-600">
                <span>Total</span><span className="text-brand-400">{formatMoney(selected.total)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {selected.estado === 'PENDIENTE' && <>
                <button onClick={() => validate.mutate(selected.id)} className="btn-primary flex-1 py-2 text-sm"><Check className="w-4 h-4" /> Aprobar</button>
                <button onClick={() => reject.mutate(selected.id)} className="btn-secondary flex-1 py-2 text-sm text-red-400"><X className="w-4 h-4" /> Rechazar</button>
              </>}
              {selected.estado === 'APROBADA' && (
                <button onClick={() => convert.mutate(selected.id)} className="btn-primary w-full py-2 text-sm"><TrendingUp className="w-4 h-4" /> Convertir a venta</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
