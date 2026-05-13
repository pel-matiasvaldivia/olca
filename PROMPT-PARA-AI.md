# 🤖 PROMPT PARA CLAUDE / AI - GENERAR SOLUCIÓN OLCA COMPLETA

Usa este prompt completo con Claude (o tu AI preferido) para generar toda la solución automáticamente.

---

## 📋 INSTRUCCIONES PARA EL IA

```
Eres un arquitecto de software senior con experiencia en:
- Aplicaciones full-stack modernas con React + Node.js
- Integraciones con sistemas ERP (Odoo, SAP, NetSuite)
- Escalabilidad y performance en producción
- DevOps, Docker, Kubernetes
- Seguridad y best practices

Tu tarea: GENERAR UNA SOLUCIÓN COMPLETA para una plataforma SaaS de cotización.

CONTEXTO:
=========
Empresa: OLCA Rental (alquiler de flota vehicular en Argentina)
Problema: Proceso de cotización lento y manual
Solución: Plataforma automatizada conectada a su ERP

REQUISITOS FUNCIONALES:
=======================
1. COTIZADOR WEB
   - Cliente llena formulario en 5 pasos
   - Productos vienen del ERP en tiempo real
   - Cálculo automático de precios con validaciones
   - Envío de emails (cliente + comercial)
   - Responsive en mobile/tablet/desktop
   - Tiempo de cotización: < 3 minutos

2. INTEGRACIÓN ERP
   - Sincronización de productos desde ERP (Odoo, SAP, custom API REST)
   - Sync inicial: todos los productos
   - Sync continuo: cambios en tiempo real (webhooks)
   - Sync periódico: cada hora scheduled job
   - Validación de stock y precios en tiempo real

3. DASHBOARD COMERCIAL
   - Login y autenticación
   - Ver todas las cotizaciones (tabla filtrable)
   - Validar/rechazar cotizaciones
   - Marcar como convertida a venta
   - CRM integrado (historial de cliente)
   - Reportes y analytics

4. NOTIFICACIONES
   - Real-time alerts cuando llega nueva cotización
   - Alerts de cambios en ERP (precios, stock)
   - Emails automáticos (bienvenida, confirmación, recordatorio)

5. SEGURIDAD
   - Autenticación JWT + refresh tokens
   - RBAC (roles: admin, manager, sales, viewer, client)
   - Validación de datos (Zod)
   - Rate limiting
   - HTTPS y CORS configurado
   - SQL injection protection (Prisma ORM)

6. ESCALABILIDAD
   - Soportar 10,000+ cotizaciones/día
   - Cache inteligente (Redis)
   - Job queue (Bull) para procesos pesados
   - Database indexes optimizados
   - CDN para assets estáticos

REQUISITOS TÉCNICOS:
====================
Stack Frontend:
- React 18+ (Vite)
- TypeScript
- Tailwind CSS + Shadcn/ui
- React Router v6
- React Query
- Zustand (state management)
- React Hook Form + Zod (forms)
- Axios (HTTP)
- PWA ready

Stack Backend:
- Node.js 20 LTS
- Fastify (web framework)
- TypeScript
- PostgreSQL 15
- Prisma ORM
- Redis (cache + sessions)
- Bull Queue (job processing)
- JWT authentication
- Winston (logging)
- Jest (testing)

Stack DevOps:
- Docker + Docker Compose
- GitHub Actions (CI/CD)
- Optional: Kubernetes
- Optional: Terraform

ERP Integrations:
- Odoo (REST API)
- SAP C4C (Web Services)
- NetSuite (SuiteTalk)
- Generic REST API connector
- Webhook support for webhooks

ESTRUCTURA DE CARPETAS:
======================

Frontend:
```
frontend/
├── src/
│   ├── pages/              # Rutas principales
│   │   ├── Landing.tsx
│   │   ├── QuoterWizard.tsx
│   │   ├── Dashboard.tsx
│   │   └── Auth/
│   ├── components/         # Componentes reutilizables
│   │   ├── ui/             # Shadcn components
│   │   ├── QuoteForm/
│   │   ├── ProductSelector/
│   │   ├── PriceCalculator/
│   │   └── ...
│   ├── hooks/              # Custom hooks
│   │   ├── useQuote.ts
│   │   ├── useERP.ts
│   │   └── ...
│   ├── services/           # API calls
│   │   ├── api.ts
│   │   ├── erp.ts
│   │   └── auth.ts
│   ├── store/              # Zustand stores
│   │   ├── quoteStore.ts
│   │   ├── authStore.ts
│   │   └── ...
│   ├── types/              # TypeScript interfaces
│   │   ├── quote.ts
│   │   ├── product.ts
│   │   └── ...
│   ├── utils/
│   ├── styles/
│   └── App.tsx
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── .env.example
```

Backend:
```
backend/
├── src/
│   ├── routes/            # Endpoint definitions
│   │   ├── quotes.ts
│   │   ├── erp.ts
│   │   ├── auth.ts
│   │   └── ...
│   ├── controllers/       # Request handlers
│   │   ├── quoteController.ts
│   │   ├── erpController.ts
│   │   └── ...
│   ├── services/          # Business logic
│   │   ├── quoteService.ts
│   │   ├── priceService.ts
│   │   ├── erpService.ts
│   │   └── ...
│   ├── repositories/      # Data access
│   │   ├── quoteRepository.ts
│   │   ├── productRepository.ts
│   │   └── ...
│   ├── middleware/        # Auth, validation, logging
│   │   ├── auth.ts
│   │   ├── validate.ts
│   │   └── ...
│   ├── integrations/      # ERP connectors
│   │   ├── odoo.ts
│   │   ├── sap.ts
│   │   ├── generic.ts
│   │   └── ...
│   ├── jobs/              # Background jobs
│   │   ├── syncERPProducts.ts
│   │   ├── sendEmails.ts
│   │   └── ...
│   ├── types/
│   ├── utils/
│   ├── config/
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── migrations/
│   └── main.ts
├── tests/                 # Jest tests
├── package.json
├── tsconfig.json
├── .env.example
└── docker-compose.yml
```

DATABASE SCHEMA (Prisma):
========================
model User {
  id String @id @default(cuid())
  email String @unique
  password String
  nombre String
  rol Role @default(SALES)
  activo Boolean @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  quotes Quote[]
  organization Organization?
  @@index([email])
}

model Organization {
  id String @id @default(cuid())
  nombre String
  dominio String @unique
  logo String?
  owner User @relation(fields: [ownerId], references: [id])
  ownerId String @unique
  
  erpConfig ERPConfig?
  quotes Quote[]
  createdAt DateTime @default(now())
}

model Product {
  id String @id @default(cuid())
  erp_id String @unique  // ID en el ERP
  nombre String
  descripcion String?
  categoria String
  precio_base Float
  stock Int
  imagen String?
  especificaciones Json?
  ultima_sincronizacion DateTime
  activo Boolean @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  quoteItems QuoteItem[]
  @@index([categoria])
  @@index([ultima_sincronizacion])
}

model Quote {
  id String @id @default(cuid())
  numero String @unique
  user User @relation(fields: [userId], references: [id])
  userId String
  organization Organization @relation(fields: [organizationId], references: [id])
  organizationId String
  
  // Cliente info
  cliente_nombre String
  cliente_email String
  cliente_telefono String
  
  // Cotización
  estado QuoteStatus @default(PENDIENTE)
  subtotal Float
  descuentos Float @default(0)
  impuestos Float
  total Float
  
  // Items
  items QuoteItem[]
  
  // Seguimiento
  validada_por User?
  validada_en DateTime?
  convertida_a_venta Boolean @default(false)
  notas String?
  
  // Públic sharing
  token_publico String @unique
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([cliente_email])
  @@index([estado])
  @@index([createdAt])
}

model QuoteItem {
  id String @id @default(cuid())
  quote Quote @relation(fields: [quoteId], references: [id], onDelete: Cascade)
  quoteId String
  
  product Product @relation(fields: [productId], references: [id])
  productId String
  
  cantidad Int
  fecha_inicio DateTime
  fecha_fin DateTime
  precio_unitario Float
  subtotal Float
  
  @@index([quoteId])
}

model ERPConfig {
  id String @id @default(cuid())
  organization Organization @relation(fields: [organizationId], references: [id])
  organizationId String @unique
  
  tipo String // "odoo", "sap", "netsuite", "custom"
  api_url String
  api_key String @db.Text
  secret String @db.Text
  entity_mapping Json?
  
  ultimo_sync DateTime?
  sync_activo Boolean @default(true)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

FLUJO TÉCNICO:
==============

1. FRONTEND (Cliente cotiza)
   ├─ Step 1: Completa datos personales
   ├─ Step 2: Busca productos (GET /api/erp/products)
   │  └─ Productos vienen del cache Redis (sync cada hora)
   ├─ Step 3: Selecciona cantidad, fechas
   ├─ Step 4: Ve precio calculado (POST /api/quotes/calculate)
   ├─ Step 5: Envía (POST /api/quotes)
   │  └─ Backend valida, crea documento, envía emails
   └─ Success: Recibe número de cotización

2. BACKEND (Procesa cotización)
   ├─ Valida datos con Zod
   ├─ Chequea stock en ERP (GET /erp/product/{id})
   ├─ Calcula precio con reglas de negocio
   ├─ Crea documento en PostgreSQL
   ├─ Invalida cache (Redis)
   ├─ Cola job: Enviar emails (Bull)
   ├─ Cola job: Sincronizar con CRM (opcional)
   └─ Retorna cotización creada

3. ERP SYNC (Background job)
   ├─ CRON cada hora (schedular con Bull)
   ├─ GET /erp/products (desde ERP)
   ├─ Transforma respuesta según entity_mapping
   ├─ Upsert en PostgreSQL
   ├─ Invalida cache Redis
   ├─ Emite eventos (WebSocket/SSE) a clientes conectados
   └─ Registra log de sync

4. COMERCIAL (Dashboard)
   ├─ Login (POST /api/auth/login)
   │  └─ Retorna JWT token + refresh token
   ├─ GET /api/dashboard (overview)
   │  └─ Cotizaciones pendientes, conversión rate, ingresos
   ├─ GET /api/quotes (tabla de cotizaciones)
   │  └─ Filtrable, paginable, sorteable
   ├─ GET /api/quotes/{id} (detalle)
   │  └─ Todo sobre la cotización
   ├─ POST /api/quotes/{id}/validate (validar)
   │  └─ Marca como validada, envía email al cliente
   └─ POST /api/quotes/{id}/convert (convertir a venta)
      └─ Marca como convertida, registra analytics

5. NOTIFICACIONES (Real-time)
   ├─ WebSocket connection (socket.io o nativo)
   ├─ Eventos:
   │  ├─ 'new-quote' → Comercial recibe alerta
   │  ├─ 'product-updated' → Productos actualizados
   │  ├─ 'stock-alert' → Stock bajo
   │  └─ 'price-changed' → Precio cambió
   └─ SSE (Server-Sent Events) como fallback

ENTREGABLES:
=============

1. Código fuente completo (Frontend + Backend)
2. Archivos de configuración (docker-compose, .env, etc)
3. Script de instalación automatizado
4. Database schema (Prisma migrations)
5. API documentation (Swagger/OpenAPI)
6. Deploy guide (Docker + Cloud provider)
7. Development guide (cómo levantar localmente)
8. Testing suite (Unit + Integration + E2E)
9. Monitoring setup (Sentry, Prometheus, etc)
10. CI/CD pipeline (GitHub Actions)

INSTRUCCIONES GENERACIÓN:
=========================

1. Estructura el código en componentes pequeños, reutilizables
2. Usa TypeScript en 100% del código
3. Implementa validación en entrada (Zod)
4. Agrega tests para funciones críticas
5. Documenta cada función pública
6. Usa best practices de React (hooks, memoization, code splitting)
7. Optimiza performance (caching, lazy loading, compression)
8. Implementa error handling robusto
9. Agrega logging detallado
10. Crea ejemplos de uso y documentación

OUTPUT ESPERADO:
================

Estructura de archivos completa:
- Código React listo para producción
- Servidor Fastify con rutas y controladores
- Schema de base de datos
- Docker Compose para levantar todo
- Scripts de utilidad (seed DB, reset, etc)
- Ejemplos de integración ERP
- Tests unitarios y de integración
- Documentación completa
- Guía de deployment

NOTA IMPORTANTE:
================
Este es un proyecto realista de escala mediana-grande.
Requiere cuidado con:
- Validación de datos en cliente Y servidor
- Manejo de errores (async/await)
- Performance y caching
- Security (CORS, CSRF, SQL injection)
- Testing de funciones críticas
- Documentación clara

¡GENERA LA SOLUCIÓN COMPLETA Y LISTA PARA PRODUCCIÓN!
```

---

## 🎯 CÓMO USAR ESTE PROMPT

### Con Claude (vía API):

```python
import anthropic

client = anthropic.Anthropic(api_key="tu-api-key")

with open("PROMPT-TECNICO-COMPLETO.md", "r") as f:
    prompt = f.read()

response = client.messages.create(
    model="claude-opus-4-20250514",
    max_tokens=100000,
    messages=[
        {
            "role": "user",
            "content": prompt + """
            
            Ahora genera:
            1. Estructura completa de carpetas (mkdirs commands)
            2. Código del frontend (React components principales)
            3. Código del backend (Fastify rutas y servicios)
            4. Schema Prisma
            5. Docker compose
            6. Package.json files
            7. Scripts de configuración
            8. Ejemplos de integración ERP
            9. Tests básicos
            10. Documentación README
            """
        }
    ]
)

print(response.content[0].text)
```

### Con ChatGPT/GPT-4:

1. Copia el contenido de `PROMPT-TECNICO-COMPLETO.md`
2. Pega en ChatGPT
3. Agrega: "Generate the complete solution with code"
4. Espera a que genere la solución

### Con otros LLMs:

El prompt es agnóstico y funciona con:
- Claude (Anthropic)
- GPT-4 (OpenAI)
- Gemini (Google)
- LLaMA (Meta)
- Mistral
- Etc.

---

## 🚀 PRÓXIMOS PASOS

1. Ejecuta el prompt con tu AI favorito
2. Recibe código completo listo para usar
3. Personaliza según necesidades específicas
4. Levanta con Docker
5. Deploya a producción

---

**¡Buena suerte con tu proyecto! 🎉**
