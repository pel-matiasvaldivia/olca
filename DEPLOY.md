# 🚢 DEPLOY — OLCA Rental en VPS

## Prerequisitos en el servidor

```bash
# Docker + Docker Compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Nginx (como reverse proxy externo, opcional)
sudo apt install nginx certbot python3-certbot-nginx -y
```

---

## 1. Clonar el repositorio

```bash
git clone https://github.com/tu-org/olca.git
cd olca
```

## 2. Configurar variables de entorno

```bash
cp .env.example .env
nano .env   # Completar TODOS los valores de producción
```

**Valores críticos a cambiar:**
- `POSTGRES_PASSWORD` — contraseña fuerte
- `REDIS_PASSWORD` — contraseña fuerte
- `JWT_SECRET` — string aleatorio 64 chars (`openssl rand -hex 32`)
- `JWT_REFRESH_SECRET` — otro string aleatorio
- `SMTP_*` — credenciales de email
- `FRONTEND_URL` — URL pública de producción

## 3. Build y deploy

```bash
# Build y levantar todos los servicios
docker compose --profile production up -d --build

# Verificar
docker compose ps
docker compose logs backend --tail=50
```

## 4. Migraciones y seed inicial

```bash
# Ejecutar migraciones
docker compose exec backend npx prisma migrate deploy

# Seed inicial (solo primera vez)
docker compose exec backend node dist/utils/seed.js
```

## 5. Nginx reverse proxy (HTTPS)

```nginx
# /etc/nginx/sites-available/olca
server {
    server_name cotizador.olca.com.ar;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/olca /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# HTTPS con Let's Encrypt
sudo certbot --nginx -d cotizador.olca.com.ar
```

## 6. Actualizar la aplicación

```bash
git pull
docker compose --profile production up -d --build
docker compose exec backend npx prisma migrate deploy
```

## 7. Backups de la base de datos

```bash
# Backup manual
docker compose exec postgres pg_dump -U olca olca_db > backup_$(date +%Y%m%d).sql

# Restore
cat backup_20260513.sql | docker compose exec -T postgres psql -U olca olca_db
```

## 8. Monitoreo

```bash
# Logs en tiempo real
docker compose logs -f backend
docker compose logs -f frontend

# Estado
docker compose ps

# Restart de un servicio
docker compose restart backend
```

---

## Puertos usados

| Servicio | Puerto interno | Puerto externo |
|---|---|---|
| Frontend (nginx) | 80 | 80 |
| Backend (Fastify) | 3001 | 3001 |
| PostgreSQL | 5432 | 5432 (solo localhost) |
| Redis | 6379 | 6379 (solo localhost) |
