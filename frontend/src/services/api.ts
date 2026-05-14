import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Inject token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('olca_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('olca_refresh_token');
        const { data } = await axios.post('/api/auth/refresh', { refreshToken });
        localStorage.setItem('olca_access_token', data.data.accessToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(original);
      } catch {
        localStorage.removeItem('olca_access_token');
        localStorage.removeItem('olca_refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Auth ──────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string, organizationSlug: string) =>
    api.post('/auth/login', { email, password, organizationSlug }),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// ── Products / ERP ────────────────────────────────────
export const productsApi = {
  list: (params?: { categoria?: string; search?: string; orgSlug?: string }) =>
    api.get('/erp/products', { params }),
  get: (id: string) => api.get(`/erp/products/${id}`),
  sync: () => api.post('/erp/sync'),
  categorias: () => api.get('/erp/categorias'),
};

// ── Quotes ────────────────────────────────────────────
export const quotesApi = {
  calculate: (payload: unknown) => api.post('/quotes/calculate', payload),
  create: (payload: unknown) => api.post('/quotes', payload),
  list: (params?: Record<string, unknown>) => api.get('/quotes', { params }),
  get: (id: string) => api.get(`/quotes/${id}`),
  getPublic: (token: string) => api.get(`/quotes/public/${token}`),
  validate: (id: string) => api.post(`/quotes/${id}/validate`),
  reject: (id: string, motivo?: string) => api.post(`/quotes/${id}/reject`, { motivo }),
  convert: (id: string) => api.post(`/quotes/${id}/convert`),
};

// ── Settings ──────────────────────────────────────────
export const settingsApi = {
  getEmailConfig: () => api.get('/settings/email'),
  updateEmailConfig: (payload: unknown) => api.post('/settings/email', payload),
  testEmail: (data: any) => api.post('/settings/email/test', data),
};

// ── Dashboard ─────────────────────────────────────────
export const dashboardApi = {
  stats: () => api.get('/dashboard'),
  charts: () => api.get('/dashboard/charts'),
  recent: () => api.get('/dashboard/recent'),
};
