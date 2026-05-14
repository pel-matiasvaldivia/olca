import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Mail, Loader2, Save } from 'lucide-react';
import { settingsApi } from '../../services/api';
import toast from 'react-hot-toast';

export default function Settings() {
  const { data, isLoading } = useQuery({ 
    queryKey: ['email-config'], 
    queryFn: () => settingsApi.getEmailConfig() 
  });

  const mutation = useMutation({
    mutationFn: (payload: any) => settingsApi.updateEmailConfig(payload),
    onSuccess: () => toast.success('Configuración guardada'),
    onError: () => toast.error('Error al guardar'),
  });

  const config = data?.data?.data;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    mutation.mutate({
      ...payload,
      port: parseInt(payload.port as string),
      secure: payload.secure === 'on',
    });
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-brand-400" /></div>;

  return (
    <div className="animate-in space-y-6">
      <div>
        <h1 className="text-2xl font-black text-dark-50">Configuración</h1>
        <p className="text-dark-400 text-sm mt-1">Ajustes generales de la plataforma</p>
      </div>

      <div className="card p-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-400/10 flex items-center justify-center">
            <Mail className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-dark-100">Servidor de Correo (SMTP)</h2>
            <p className="text-xs text-dark-400">Configura el servidor para enviar las cotizaciones por email</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="label text-dark-300 mb-1 block">Host SMTP</label>
              <input name="host" defaultValue={config?.host} className="input w-full" placeholder="smtp.gmail.com" required />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="label text-dark-300 mb-1 block">Puerto</label>
              <input name="port" type="number" defaultValue={config?.port || 587} className="input w-full" placeholder="587" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="label text-dark-300 mb-1 block">Usuario / Email</label>
              <input name="user" defaultValue={config?.user} className="input w-full" placeholder="tu@email.com" required />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="label text-dark-300 mb-1 block">Contraseña</label>
              <input name="pass" type="password" defaultValue={config?.pass} className="input w-full" placeholder="••••••••" required />
            </div>
          </div>

          <hr className="border-dark-700 my-4" />

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="label text-dark-300 mb-1 block">Nombre Remitente</label>
              <input name="fromName" defaultValue={config?.fromName} className="input w-full" placeholder="OLCA Rental" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="label text-dark-300 mb-1 block">Email Remitente (opcional)</label>
              <input name="fromEmail" defaultValue={config?.fromEmail} className="input w-full" placeholder="no-reply@olca.com" />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input name="secure" type="checkbox" defaultChecked={config?.secure} className="w-4 h-4 rounded border-dark-600 bg-dark-700 text-brand-400 focus:ring-brand-400" />
            <label className="text-sm text-dark-300">Usar conexión segura (SSL/TLS)</label>
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={mutation.isPending} className="btn-primary gap-2">
              {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar configuración
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
