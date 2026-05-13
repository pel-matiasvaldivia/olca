import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { ArrowRight, Calendar, Minus, Plus } from 'lucide-react';
import { useQuoteStore } from '../../store/quoteStore';
import { diffDays, formatMoney } from '../../utils/cn';

export default function Step3Details() {
  const { items, updateItem, nextStep } = useQuoteStore();

  const today = new Date().toISOString().split('T')[0];
  const minEnd = (start: string) => {
    const d = new Date(start);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const handleChange = (productId: string, field: 'cantidad' | 'fechaInicio' | 'fechaFin', value: string | number) => {
    updateItem(productId, { [field]: value });
  };

  const canContinue = items.every((i) => {
    const days = diffDays(i.fechaInicio, i.fechaFin);
    return days > 0 && i.cantidad > 0;
  });

  return (
    <div className="card p-8 animate-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-brand-400/10 flex items-center justify-center">
          <Calendar className="w-5 h-5 text-brand-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-dark-50">Período de alquiler</h2>
          <p className="text-sm text-dark-400">Definí cantidades y fechas por vehículo</p>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item) => {
          const dias = diffDays(item.fechaInicio, item.fechaFin);
          const subtotal = (item.product?.precioBase ?? 0) * item.cantidad * dias;

          return (
            <div key={item.productId} className="bg-dark-700/50 border border-dark-600 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-semibold text-dark-100">{item.product?.nombre}</h3>
                  <p className="text-xs text-dark-500">{item.product?.categoria} · {formatMoney(item.product?.precioBase ?? 0)}/día</p>
                </div>
                {dias > 0 && (
                  <div className="text-right flex-shrink-0">
                    <div className="text-brand-400 font-bold">{formatMoney(subtotal)}</div>
                    <div className="text-xs text-dark-500">{dias} días × {item.cantidad} unid.</div>
                  </div>
                )}
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                {/* Quantity */}
                <div>
                  <label className="label">Cantidad</label>
                  <div className="flex items-center gap-2">
                    <button type="button"
                      onClick={() => handleChange(item.productId, 'cantidad', Math.max(1, item.cantidad - 1))}
                      className="w-9 h-9 rounded-lg bg-dark-600 hover:bg-dark-500 flex items-center justify-center text-dark-200 transition-colors">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="flex-1 text-center font-bold text-dark-100 text-lg">{item.cantidad}</span>
                    <button type="button"
                      onClick={() => handleChange(item.productId, 'cantidad', item.cantidad + 1)}
                      className="w-9 h-9 rounded-lg bg-dark-600 hover:bg-dark-500 flex items-center justify-center text-dark-200 transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Start date */}
                <div>
                  <label className="label">Fecha inicio</label>
                  <input
                    type="date"
                    min={today}
                    value={item.fechaInicio}
                    onChange={(e) => handleChange(item.productId, 'fechaInicio', e.target.value)}
                    className="input"
                  />
                </div>

                {/* End date */}
                <div>
                  <label className="label">Fecha fin</label>
                  <input
                    type="date"
                    min={minEnd(item.fechaInicio)}
                    value={item.fechaFin}
                    onChange={(e) => handleChange(item.productId, 'fechaFin', e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              {dias <= 0 && (
                <p className="text-xs text-red-400 mt-2">La fecha de fin debe ser posterior a la de inicio</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end mt-6">
        <button onClick={nextStep} disabled={!canContinue} className="btn-primary">
          Ver precio <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
