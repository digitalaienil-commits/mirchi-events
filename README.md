# Mirchi Events

A one-page events site for Radio Mirchi with an admin portal. Each event card links out to its own ticketing, registration or voting page. Styling follows district.in/events.

- **Public page** (`/`): featured-event hero carousel, category chips, search, and an event grid.
- **Admin portal** (`/admin`): add, edit, hide, delete and drag-reorder events, choose hero events, upload posters, and manage categories.

Built with Next.js 15, Tailwind CSS 4 and **PostgreSQL**. Admin login and poster storage are built in, so no external services are needed. It runs on any VM with Node.js 22+ and PostgreSQL 13+.

## Run locally

```bash
npm install
cp .env.example .env.local          # then fill in DATABASE_URL and SESSION_SECRET
npm run db:migrate                  # create tables
npm run db:seed                     # add starter categories + the 3 launch events
npm run admin:create -- you@radiomirchi.com
npm run dev
```

`admin:create` prints a generated password once. You can also pass your own: `npm run admin:create -- you@radiomirchi.com 'a-long-password'`.

## Managing admins

| Task | Command |
| --- | --- |
| Add an admin, or reset a password | `npm run admin:create -- person@radiomirchi.com` |
| Remove an admin (takes effect immediately) | `npm run admin:remove -- person@radiomirchi.com` |
| List admins | `npm run admin:list` |

## Deploy on a VM (Ubuntu example)

```bash
# 1. Install Node.js 22+, PostgreSQL and Nginx
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs postgresql nginx

# 2. Create the database and a database user
sudo -u postgres psql -c "create role mirchi_events login password 'CHOOSE-A-STRONG-PASSWORD'"
sudo -u postgres psql -c "create database mirchi_events owner mirchi_events"

# 3. Put the app in /opt/mirchi-events, owned by a service user
sudo useradd --system --create-home mirchi
sudo mkdir -p /opt/mirchi-events /var/lib/mirchi-events/uploads
sudo chown -R mirchi:mirchi /opt/mirchi-events /var/lib/mirchi-events
# copy/clone the project into /opt/mirchi-events (without node_modules, .next, .env.local)

# 4. Configure (as the mirchi user)
cd /opt/mirchi-events
cp .env.example .env
#   DATABASE_URL=postgres://mirchi_events:CHOOSE-A-STRONG-PASSWORD@127.0.0.1:5432/mirchi_events
#   SESSION_SECRET=<output of: openssl rand -base64 32>
#   UPLOAD_DIR=/var/lib/mirchi-events/uploads

# 5. Install, set up the database, build
npm ci
npm run db:migrate
npm run db:seed
npm run admin:create -- you@radiomirchi.com
npm run build

# 6. Run it as a service, behind Nginx with HTTPS
sudo cp deploy/mirchi-events.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now mirchi-events
sudo cp deploy/nginx.conf /etc/nginx/sites-available/mirchi-events   # edit server_name first
sudo ln -s /etc/nginx/sites-available/mirchi-events /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d events.yourdomain.com
```

Admin login cookies are marked `Secure` in production, so the admin portal needs **HTTPS**. To test over plain `http://` first, add `COOKIE_SECURE=false` to `.env` temporarily.

**Updating the site later:** pull the new code, then run `npm ci && npm run db:migrate && npm run build && sudo systemctl restart mirchi-events`.

**Backups:** back up the database (`pg_dump mirchi_events > backup.sql`) and the `UPLOAD_DIR` folder, which holds the posters.

## Where things live

| What | Where |
| --- | --- |
| Logo | `public/brand/mirchi-logo.png` |
| Brand colours | `app/globals.css` (`--color-mirchi`, `--color-leaf`) |
| Header/footer links | `lib/site.ts` |
| Public page | `app/page.tsx`, `components/site/*` |
| Admin pages | `app/admin/*`, `components/admin/*` |
| Data changes (server actions) | `app/admin/actions.ts` |
| Login / sessions | `app/admin/auth-actions.ts`, `lib/session.ts`, `lib/auth.ts`, `middleware.ts` |
| Poster upload & serving | `app/api/upload/route.ts`, `app/uploads/[name]/route.ts`, `lib/uploads.ts` |
| Database schema | `db/migrations/*.sql` (new changes go in a new numbered file) |
| DB & admin commands | `scripts/db.mjs` |

Posters: portrait 3:4 (e.g. 900 × 1200 px), JPG/PNG/WebP, up to 4 MB. Events without a poster get a branded gradient placeholder.
