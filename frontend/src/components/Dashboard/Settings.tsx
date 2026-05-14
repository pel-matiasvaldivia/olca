import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Mail, Loader2, Save, Send } from 'lucide-react';
import { settingsApi } from '../../services/api';
import toast from 'react-hot-toast';

export default function Settings() {
  const [testEmail, setTestEmail] = useState('');
  
  const { data, isLoading } = useQuery({ 
    queryKey: ['email-config'], 
    queryFn: () => settingsApi.getEmailConfig() 
  });

  const mutation = useMutation({
    mutationFn: (payload: any) => settingsApi.updateEmailConfig(payload),
    onSuccess: () => toast.success('Configuración guardada'),
    onError: () => toast.error('Error al guardar'),
  });

  const testMutation = useMutation({
    mutationFn: (payload: any) => settingsApi.testEmail(payload),
    onSuccess: () => toast.success('Email de prueba enviado exitosamente'),
    onError: (err: any) => {
      const msg = err.response?.data?.error || err.message;
      toast.error(`Error: ${msg}`, { duration: 10000 });
    },
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

  const handleTestEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    const form = (e.currentTarget as HTMLElement).closest('form') as HTMLFormElement;
    if (!form) return;
    
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    
    if (!testEmail) {
      toast.error('Ingresa un email para la prueba');
      return;
    }

    testMutation.mutate({
      ...payload,
      port: parseInt(payload.port as string),
      secure: payload.secure === 'on',
      testEmail
    });
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-brand-600" /></div>;

  return (
    <div className="animate-in space-y-6">
      <div>
        <h1 className="text-2xl font-black text-dark-900">Configuración</h1>
        <p className="text-dark-500 text-sm font-medium mt-1">Ajustes generales de la plataforma</p>
      </div>

      <div className="card p-8 max-w-2xl bg-white border-dark-200">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
            <Mail className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-dark-900">Servidor de Correo (SMTP)</h2>
            <p className="text-xs text-dark-500 font-bold uppercase tracking-wider">Configura el servidor para enviar las cotizaciones</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="label">Host SMTP</label>
              <input name="host" defaultValue={config?.host} className="input w-full" placeholder="smtp.gmail.com" required />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="label">Puerto</label>
              <input name="port" type="number" defaultValue={config?.port || 587} className="input w-full" placeholder="587" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="label">Usuario / Email</label>
              <input name="user" defaultValue={config?.user} className="input w-full" placeholder="tu@email.com" required />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="label">Contraseña</label>
              <input name="pass" type="password" defaultValue={config?.pass} className="input w-full" placeholder="••••••••" required />
            </div>
          </div>

          <hr className="border-dark-100 my-4" />

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="label">Nombre Remitente</label>
              <input name="fromName" defaultValue={config?.fromName} className="input w-full" placeholder="OLCA Rental" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="label">Email Remitente (opcional)</label>
              <input name="fromEmail" defaultValue={config?.fromEmail} className="input w-full" placeholder="no-reply@olca.com" />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input name="secure" type="checkbox" defaultChecked={config?.secure} className="w-4 h-4 rounded border-dark-300 bg-white text-brand-600 focus:ring-brand-600" />
            <label className="text-sm text-dark-600 font-bold uppercase tracking-widest text-[10px]">Usar conexión segura (SSL/TLS)</label>
          </div>

          <div className="flex justify-end pt-4 gap-3">
            <button type="submit" disabled={mutation.isPending} className="btn-primary gap-2">
              {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar configuración
            </button>
          </div>

          <div className="mt-8 p-6 bg-dark-50 border border-dark-200 rounded-xl">
            <h3 className="text-sm font-black text-dark-900 uppercase tracking-widest mb-4">Validar configuración</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Email para recibir prueba" 
                className="input flex-1" 
              />
              <button 
                type="button"
                onClick={handleTestEmail}
                disabled={testMutation.isPending}
                className="btn-secondary border-brand-500 text-brand-600 gap-2"
              >
                {testMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Enviar prueba
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
