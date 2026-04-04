# Server Setup — DigitalOcean Droplet

Passos para configurar o servidor do zero (Ubuntu 22.04 LTS).

---

## 1. Dependências do sistema

```bash
# Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# pnpm
npm install -g pnpm@9

# PM2
npm install -g pm2

# Nginx + Certbot
sudo apt-get install -y nginx certbot python3-certbot-nginx

# PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib
```

---

## 2. Banco de dados

```bash
sudo -u postgres psql <<EOF
CREATE USER paceplan WITH PASSWORD 'TROQUE_AQUI';
CREATE DATABASE paceplan OWNER paceplan;
EOF
```

---

## 3. Clone do repositório

```bash
sudo mkdir -p /var/www/paceplan
sudo chown $USER:$USER /var/www/paceplan
git clone https://github.com/UlerichLabs/pacePlan /var/www/paceplan
```

---

## 4. Variáveis de ambiente da API

Criar `/var/www/paceplan/apps/api/.env`:

```env
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
DATABASE_URL=postgresql://paceplan:TROQUE_AQUI@localhost:5432/paceplan
CORS_ORIGIN=https://paceplan.ulerich.com.br
```

---

## 5. Nginx

```bash
sudo cp /var/www/paceplan/infra/nginx/paceplan.conf /etc/nginx/sites-available/paceplan
sudo ln -s /etc/nginx/sites-available/paceplan /etc/nginx/sites-enabled/paceplan
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl start nginx
```

---

## 6. Certificado SSL (Certbot)

```bash
sudo certbot --nginx -d paceplan.ulerich.com.br
```

Certbot renova automaticamente via systemd timer. Para verificar:

```bash
sudo systemctl status certbot.timer
```

---

## 7. Primeiro deploy

```bash
cd /var/www/paceplan
export DATABASE_URL=postgresql://paceplan:TROQUE_AQUI@localhost:5432/paceplan

# Migrations
psql "$DATABASE_URL" -f packages/db/src/migrations/001_initial_schema.sql
psql "$DATABASE_URL" -f packages/db/src/migrations/002_expanded_schema.sql

# Build
pnpm install --frozen-lockfile
pnpm --filter @paceplan/api build
pnpm --filter @paceplan/web build

# PM2
pm2 start apps/api/ecosystem.config.js --env production
pm2 save
pm2 startup  # seguir instrução exibida para configurar autostart
```

---

## 8. Deploys subsequentes

```bash
export DATABASE_URL=postgresql://paceplan:TROQUE_AQUI@localhost:5432/paceplan
bash /var/www/paceplan/infra/deploy.sh
```

O script `deploy.sh`:
1. Faz `git pull`
2. Reinstala dependências
3. Rebuilda API e web
4. Roda migrations (idempotentes via `IF NOT EXISTS` / `IF EXISTS`)
5. Recarrega API via PM2
6. Recarrega Nginx

---

## 9. Logs úteis

```bash
# API
pm2 logs paceplan-api

# Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# PostgreSQL
sudo journalctl -u postgresql -f
```
