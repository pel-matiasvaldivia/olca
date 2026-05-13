import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, User } from 'lucide-react';
import { useQuoteStore } from '../../store/quoteStore';

const schema = z.object({
  nombre: z.string().min(2, 'Ingresá tu nombre completo'),
  email: z.string().email('Email inválido'),
  telefono: z.string().optional(),
  empresa: z.string().optional(),
  cuit: z.string().optional(),
  notas: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function Step1Personal() {
  const { clientData, setClientData, nextStep } = useQuoteStore();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: clientData,
  });

  const onSubmit = (data: FormData) => {
    setClientData(data);
    nextStep();
  };

  return (
    <div className="card p-8 animate-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-brand-400/10 flex items-center justify-center">
          <User className="w-5 h-5 text-brand-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-dark-50">Tus datos de contacto</h2>
          <p className="text-sm text-dark-400">Te enviaremos la cotización por email</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="label">Nombre completo *</label>
            <input {...register('nombre')} className="input" placeholder="Juan García" />
            {errors.nombre && <p className="error-text">{errors.nombre.message}</p>}
          </div>
          <div>
            <label className="label">Email *</label>
            <input {...register('email')} type="email" className="input" placeholder="juan@empresa.com" />
            {errors.email && <p className="error-text">{errors.email.message}</p>}
          </div>
          <div>
            <label className="label">Teléfono</label>
            <input {...register('telefono')} className="input" placeholder="+54 11 1234-5678" />
          </div>
          <div>
            <label className="label">Empresa</label>
            <input {...register('empresa')} className="input" placeholder="Empresa S.A." />
          </div>
          <div>
            <label className="label">CUIT</label>
            <input {...register('cuit')} className="input" placeholder="20-12345678-9" />
          </div>
        </div>

        <div>
          <label className="label">Comentarios adicionales</label>
          <textarea {...register('notas')} className="input resize-none" rows={3}
            placeholder="Zonas de operación, necesidades especiales, etc." />
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" className="btn-primary">
            Continuar — Elegir vehículos <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
