# OLCA Rental — Plataforma de Cotización

> Plataforma SaaS multi-tenant para automatizar cotizaciones de flota vehicular corporativa.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| Backend | Node.js 20 + Fastify + TypeScript |
| Base de datos | PostgreSQL 15 + Prisma ORM |
| Cache / Queue | Redis + Bull |
| ERP | Odoo (REST/RPC) — mock mode en dev |
| Deploy | Docker Compose (VPS) |

---

## 🚀 Inicio rápido (desarrollo)

### 1. Prerequisitos
- Node.js 20+
- Docker Desktop

### 2. Levantar infraestructura
```bash
# Copiar variables de entorno
cp .env.example .env

# Levantar PostgreSQL + Redis
docker compose up postgres redis -d
```

### 3. Backend
```bash
cd backend
cp .env.example .env
npm install

# Generar cliente Prisma y migrar DB
npm run db:generate
npm run db:migrate

# Seed inicial (crea org OLCA + usuario admin)
npm run db:seed

# Servidor de desarrollo
npm run dev
```
**Backend corre en:** `http://localhost:3001`
**Swagger / API Docs:** `http://localhost:3001/api/docs`

### 4. Frontend
```bash
cd frontend
npm install
npm run dev
```
**Frontend corre en:** `http://localhost:5173`

---

## 🔑 Credenciales de prueba

| Campo | Valor |
|---|---|
| URL | `http://localhost:5173` |
| Org slug | `olca` |
| Admin email | `admin@olca.com` |
| Admin password | `Admin123!` |
| Ventas email | `ventas@olca.com` |
| Ventas password | `Admin123!` |

---

## 📁 Estructura del proyecto

```
olca/
├── frontend/               # React 18 + Vite
│   ├── src/
│   │   ├── pages/          # Landing, Login, QuoterWizard, Dashboard
│   │   ├── components/
│   │   │   ├── QuoteForm/  # Steps 1-5 del wizard
│   │   │   └── Dashboard/  # QuotesTable, Analytics
│   │   ├── store/          # Zustand (auth, quote)
│   │   ├── services/       # api.ts (Axios)
│   │   └── types/          # TypeScript interfaces
│   └── ...
├── backend/                # Fastify + TypeScript
│   ├── src/
│   │   ├── routes/         # auth, erp, quotes, dashboard
│   │   ├── integrations/   # odoo.ts, mock.ts
│   │   ├── jobs/           # syncERPProducts, sendEmails
│   │   ├── config/         # database, redis, logger
│   │   └── utils/          # seed.ts
│   ├── prisma/
│   │   └── schema.prisma   # Schema multi-tenant
│   └── ...
├── docker-compose.yml
└── README.md
```

---

## 🔄 Modo ERP

El sistema arranca en **mock mode** (`ERP_MOCK_MODE=true`).

Para conectar Odoo real, en el `.env` del backend:
```env
ERP_MOCK_MODE=false
ODOO_URL=https://tu-instancia.odoo.com
ODOO_DB=nombre_de_db
ODOO_USERNAME=usuario@empresa.com
ODOO_API_KEY=tu_api_key
```

---

## 🌐 Flujo de cotización

```
Cliente → Landing → Cotizador (5 pasos)
  Step 1: Datos personales
  Step 2: Selección de vehículos (desde cache Redis/ERP)
  Step 3: Cantidad + fechas por vehículo
  Step 4: Precio calculado (IVA 21% + descuentos)
  Step 5: Confirmación → API crea Quote → Email enviado

Comercial → Dashboard → Ver cotización → Aprobar/Rechazar/Convertir
```

---

## 📊 Multi-tenant

Cada `Organization` tiene su propia:
- Flota de productos (sincronizada desde su ERP)
- Cotizaciones aisladas
- Configuración ERP
- Usuarios y roles (ADMIN, MANAGER, SALES, VIEWER)

Login: `email + password + organizationSlug`

---

## 🧪 Tests

```bash
cd backend
npm test
```

---

## 🚢 Deploy en VPS

Ver [DEPLOY.md](./DEPLOY.md)
