import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, Check, Car, ArrowRight, Loader2 } from 'lucide-react';
import { productsApi } from '../../services/api';
import { useQuoteStore } from '../../store/quoteStore';
import { Product } from '../../types';
import { formatMoney } from '../../utils/cn';

export default function Step2Products() {
  const { items, addItem, removeItem, nextStep } = useQuoteStore();
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['products', search, categoria],
    queryFn: () => productsApi.list({ search: search || undefined, categoria: categoria || undefined, orgSlug: 'olca' }),
    staleTime: 1000 * 60 * 5,
  });

  const products: Product[] = data?.data?.data?.products ?? [];
  const categorias: string[] = data?.data?.data?.categorias ?? [];
  const selectedIds = new Set(items.map((i) => i.productId));

  const toggle = (p: Product) => {
    if (selectedIds.has(p.id)) removeItem(p.id);
    else addItem(p);
  };

  return (
    <div className="animate-in space-y-6">
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand-400/10 flex items-center justify-center">
            <Car className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-dark-50">Seleccioná los vehículos</h2>
            <p className="text-sm text-dark-400">Podés elegir uno o más</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
              placeholder="Buscar vehículo..."
            />
          </div>
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)}
            className="input sm:w-48">
            <option value="">Todas las categorías</option>
            {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Product grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => {
              const selected = selectedIds.has(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => toggle(p)}
                  className={`text-left rounded-xl border transition-all duration-200 overflow-hidden group ${
                    selected
                      ? 'border-brand-400 bg-brand-400/5 shadow-brand'
                      : 'border-dark-600 bg-dark-800 hover:border-dark-400'
                  }`}
                >
                  {p.imagen && (
                    <div className="aspect-video overflow-hidden bg-dark-700">
                      <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-semibold text-dark-100 text-sm leading-tight">{p.nombre}</span>
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        selected ? 'bg-brand-400 border-brand-400' : 'border-dark-500'
                      }`}>
                        {selected && <Check className="w-3 h-3 text-dark-900" />}
                      </div>
                    </div>
                    <div className="text-xs text-dark-500 mb-3">{p.categoria}{p.marca ? ` · ${p.marca}` : ''}{p.anio ? ` ${p.anio}` : ''}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-brand-400 font-bold">{formatMoney(p.precioBase)}<span className="text-dark-500 font-normal text-xs">/día</span></span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.stock > 0 ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                        {p.stock > 0 ? `${p.stock} disp.` : 'Sin stock'}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected summary + continue */}
      {items.length > 0 && (
        <div className="card p-4 border-brand-400/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-brand-400 text-dark-900 text-xs font-bold flex items-center justify-center">
              {items.length}
            </div>
            <span className="text-sm text-dark-200">
              {items.length === 1 ? 'vehículo seleccionado' : 'vehículos seleccionados'}
            </span>
          </div>
          <button onClick={nextStep} className="btn-primary py-2">
            Continuar <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
