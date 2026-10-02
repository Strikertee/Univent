# Univent — University of Ibadan Ventures Marketplace

Full-stack multi-division marketplace: one shop for all six U.I. Ventures divisions,
with role-based admin, transfer payments with receipt confirmation, and live analytics.

Live demo: run it below — no backend required (offline demo mode built in).

## Stack
- **Frontend:** React + TypeScript + Vite + Tailwind + shadcn/ui + Framer Motion + React Router + Axios
- **Backend:** Python + FastAPI + SQLAlchemy (SQLite local, Postgres on Render) + JWT
- **Payments:** Bank transfer only — receipt upload, admin confirms within a minute

## Structure
```
Frontend/                      # Vite app (port 3000, deploys to Vercel as static site)
  src/pages/Home.tsx           # landing + divisions + featured rooms/bakery + testimonials
  src/pages/hotel/             # rooms list → room detail → booking + transfer payment
  src/pages/bakery/            # bread & snacks catalogue, story, live stock
  src/pages/dashboard/         # customer hub: divisions, quick-shop, cart, orders, bookings
  src/pages/admin/             # super admin (all) + division admin (scoped) + analytics
  src/pages/info/              # about, management, careers, press, help, legal…
  src/services/api.ts          # REST client · sync.ts (API-first, local fallback)
  src/store/                   # orders, bookings, catalogue, sales (localStorage + API mirror)
  src/data/                    # catalogue content, Ventures account, testimonials
  public/images/               # all site photos (see README inside)
Backend/                       # FastAPI app (port 8000, deploys to Render via render.yaml)
  app/main.py                  # app factory, CORS, /api/health, routers
  app/models.py                # 10 tables + camelCase serializers
  app/routers/                 # auth, catalogue, bookings, orders, admin (users/sales/upload/stats)
  app/seed.py                  # idempotent seed: divisions, catalogue, admins
  tests/test_api.py            # 7 end-to-end tests (pytest)
docs/
  01-LEARN-THE-WEBSITE.md      # principles + architecture
  02-WRITEUP-AND-PRESENTATION.md# project write-up + 10-slide deck script
  03-BACKEND-LEARNERS-GUIDE.md # backend learner's guide
```

## Run everything locally (connected mode)
```bash
# Backend
cd Backend
python -m venv .venv && .\.venv\Scripts\activate
pip install -r requirements.txt
python -m app.seed
python -m uvicorn app.main:app --port 8000

# Frontend (new terminal)
cd Frontend
npm install
npm run dev        # http://localhost:3000 — /api proxies to :8000 automatically
```
Log in with a seeded account (`admin@univent.ui.edu.ng` / `password`,
`hotels@univent.ui.edu.ng` / `password`…) to get a real JWT — the app then reads
and writes through the API. Any other credentials fall back to offline demo mode.

## Run frontend only (no backend)
Just `npm install && npm run dev` in `Frontend/` — catalogue, cart, orders, bookings,
admin panels and analytics all work from local data.

## Deploy
- **Frontend → Vercel:** root `Frontend`, build `npm run build`, output `dist`.
- **Backend → Render:** New → Blueprint with `Backend/render.yaml` (web + Postgres),
  set `FRONTEND_URL` to the Vercel URL, run `python -m app.seed` once in the shell,
  then set the frontend's `VITE_API_URL` to `https://<service>/api`.

## Key flows
- **Shop:** Bakery quick-shop → cart → pickup (free) or delivery (₦550) → transfer to the
  Ventures account → upload receipt → admin confirms within a minute.
- **Book:** Room detail → dates → transfer + receipt → room number issued (e.g. `DD-04`) →
  admin confirms → approved. Reversed/failed payments release the room automatically.
- **Admins:** hotel admin manages rooms/facilities/bookings; bakery admin manages products;
  other divisions log daily sales; super admin sees revenue per division + grand total.

## Divisions
1. U.I. Bakery / U & I Fast Food (`bakery-fastfood`)
2. U.I. Petrol Station (`petrol-station`)
3. U.I. Printing Press (`printing-press`)
4. U.I. Health, Safety and Environment (`health-safety`)
5. U.I. Consultancy Services (`consultancy`)
6. U.I. Hotels (`hotels`)
