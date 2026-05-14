import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle, Send, Loader2, Link as LinkIcon } from 'lucide-react';
import { quotesApi } from '../../services/api';
import { useQuoteStore } from '../../store/quoteStore';
import { formatMoney } from '../../utils/cn';
import toast from 'react-hot-toast';

export default function Step5Confirm() {
  const {
    clientData, items, calculation, nextStep,
    setSubmitted, submittedQuoteNumero, submittedQuoteId, reset,
  } = useQuoteStore();

  const mutation = useMutation({
    mutationFn: () =>
      quotesApi.create({
        clienteNombre: clientData.nombre,
        clienteEmail: clientData.email,
        clienteTelefono: clientData.telefono,
        clienteEmpresa: clientData.empresa,
        clienteCuit: clientData.cuit,
        clienteNotas: clientData.notas,
        descuentoPct: calculation?.descuentoPct || 0,
        items: items.map((i) => ({
          productId: i.productId,
          cantidad: i.cantidad,
          fechaInicio: i.fechaInicio,
          fechaFin: i.fechaFin,
        })),
        orgSlug: 'olca',
      }),
    onSuccess: (res) => {
      const q = res.data.data;
      setSubmitted(q.id, q.numero);
      toast.success('¡Cotización enviada con éxito!');
    },
    onError: () => toast.error('Error al enviar la cotización. Intentá de nuevo.'),
  });

  // Success state
  if (submittedQuoteNumero) {
    return (
      <div className="card p-12 text-center animate-in">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-20 h-20 rounded-full bg-brand-400/10 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-10 h-10 text-brand-400" />
        </motion.div>
        <h2 className="text-2xl font-black text-dark-50 mb-2">¡Cotización enviada!</h2>
        <p className="text-dark-400 mb-4">
          Recibiste un email con el detalle. Un comercial te contactará a la brevedad.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-400/10 border border-brand-400/20 rounded-xl text-brand-400 font-bold text-lg mb-8">
          {submittedQuoteNumero}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={reset} className="btn-secondary">Nueva cotización</button>
          <a href="https://olca.com.ar" className="btn-primary">Volver al sitio</a>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-8 animate-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-brand-400/10 flex items-center justify-center">
          <Send className="w-5 h-5 text-brand-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-dark-50">Confirmá tu cotización</h2>
          <p className="text-sm text-dark-400">Revisá todo antes de enviar</p>
        </div>
      </div>

      {/* Summary */}
      <div className="space-y-4 mb-6">
        <div className="bg-dark-700/40 rounded-xl p-5">
          <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">Datos de contacto</h3>
          <div className="grid sm:grid-cols-2 gap-2 text-sm">
            <div><span className="text-dark-500">Nombre: </span><span className="text-dark-100">{clientData.nombre}</span></div>
            <div><span className="text-dark-500">Email: </span><span className="text-dark-100">{clientData.email}</span></div>
            {clientData.telefono && <div><span className="text-dark-500">Tel: </span><span className="text-dark-100">{clientData.telefono}</span></div>}
            {clientData.empresa && <div><span className="text-dark-500">Empresa: </span><span className="text-dark-100">{clientData.empresa}</span></div>}
          </div>
        </div>

        <div className="bg-dark-700/40 rounded-xl p-5">
          <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">Vehículos seleccionados</h3>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="text-dark-200">{item.product?.nombre} × {item.cantidad}</span>
                <span className="text-dark-400">{item.fechaInicio} → {item.fechaFin}</span>
              </div>
            ))}
          </div>
        </div>

        {calculation && (
          <div className="bg-brand-400/5 border border-brand-400/20 rounded-xl p-5 flex justify-between items-center">
            <span className="text-dark-300">Total con IVA</span>
            <span className="text-2xl font-black text-brand-400">{formatMoney(calculation.total)}</span>
          </div>
        )}
      </div>

      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="btn-primary w-full py-4 text-base"
      >
        {mutation.isPending ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Enviando cotización...</>
        ) : (
          <><Send className="w-5 h-5" /> Enviar cotización</>
        )}
      </button>

      <p className="text-center text-xs text-dark-600 mt-4">
        Al enviar, aceptás que un comercial de OLCA Rental se contacte con vos.
      </p>
    </div>
  );
}
