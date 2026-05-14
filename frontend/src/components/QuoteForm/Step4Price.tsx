import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Loader2, Tag } from 'lucide-react';
import { quotesApi } from '../../services/api';
import { useQuoteStore } from '../../store/quoteStore';
import { PriceCalculation } from '../../types';
import { formatMoney } from '../../utils/cn';

export default function Step4Price() {
  const { items, clientData, descuentoPct, setCalculation, nextStep } = useQuoteStore();
  const [error, setError] = useState('');

  const payload = {
    items: items.map((i) => ({
      productId: i.productId,
      cantidad: i.cantidad,
      fechaInicio: i.fechaInicio,
      fechaFin: i.fechaFin,
    })),
    descuentoPct,
    orgSlug: 'olca',
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['calculate', payload],
    queryFn: () => quotesApi.calculate(payload),
    retry: 1,
  });

  const calc: PriceCalculation | undefined = data?.data?.data;

  useEffect(() => {
    if (calc) setCalculation(calc);
  }, [calc, setCalculation]);

  return (
    <div className="card p-8 animate-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-brand-400/10 flex items-center justify-center">
          <Tag className="w-5 h-5 text-brand-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-dark-50">Resumen de precios</h2>
          <p className="text-sm text-dark-400">Revisá el desglose antes de confirmar</p>
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="w-10 h-10 text-brand-400 animate-spin" />
          <p className="text-dark-400 text-sm">Calculando precio...</p>
        </div>
      )}

      {isError && (
        <div className="p-4 bg-red-900/20 border border-red-700/30 rounded-xl text-red-400 text-sm">
          Error al calcular el precio. Por favor revisá las fechas seleccionadas.
        </div>
      )}

      {calc && (
        <>
          {/* Items breakdown */}
          <div className="space-y-3 mb-6">
            {calc.items.map((item) => (
              <div key={item.productId} className="flex items-center justify-between py-3 border-b border-dark-700">
                <div>
                  <p className="text-dark-100 font-medium text-sm">{item.productoNombre}</p>
                  <p className="text-dark-500 text-xs">
                    {item.cantidad} unid. × {item.diasAlquiler} días × {formatMoney(item.precioUnitario)}/día
                  </p>
                </div>
                <span className="text-dark-100 font-semibold">{formatMoney(item.subtotal)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="bg-dark-700/50 rounded-xl p-5 space-y-3">
            <div className="flex justify-between text-sm text-dark-300">
              <span>Subtotal</span>
              <span>{formatMoney(calc.subtotal)}</span>
            </div>
            {calc.descuentoMonto > 0 && (
              <div className="flex justify-between text-sm text-green-400">
                <span>Descuento ({calc.descuentoPct}%)</span>
                <span>- {formatMoney(calc.descuentoMonto)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-dark-300">
              <span>IVA ({calc.ivaRate}%)</span>
              <span>{formatMoney(calc.ivaMonto)}</span>
            </div>
            <div className="flex justify-between text-lg font-black text-brand-400 pt-3 border-t border-dark-600">
              <span>TOTAL</span>
              <span>{formatMoney(calc.total)}</span>
            </div>
          </div>

          <p className="text-xs text-dark-500 mt-3">
            * Cotización válida por 15 días. Precios en ARS con IVA incluido.
          </p>

          <div className="flex justify-end mt-6">
            <button onClick={nextStep} className="btn-primary">
              Confirmar y enviar <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
