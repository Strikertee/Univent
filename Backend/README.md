# Univent API — FastAPI + SQLAlchemy (SQLite local, Postgres on Render)

REST backend for the University of Ibadan Ventures marketplace.
**Status: built, 7/7 tests passing, running.** See `../docs/03-BACKEND-LEARNERS-GUIDE.md`.

## Run locally
```bash
cd Backend
python -m venv .venv
.\.venv\Scripts\activate          # Windows  |  source .venv/bin/activate on Mac/Linux
pip install -r requirements.txt
cp .env.example .env
python -m app.seed                # divisions, catalogue, admins (re-runnable)
python -m uvicorn app.main:app --port 8000
```
- API: http://127.0.0.1:8000/api/health
- Interactive docs: http://127.0.0.1:8000/docs
- Tests: `python -m pytest tests/ -q`

## Deploy (Render)
Push, then **New → Blueprint** and select `render.yaml` (web service + Postgres).
Set `FRONTEND_URL` to the Vercel URL, then run once in the Render shell:
```bash
python -m app.seed
```
Point the frontend at it: `VITE_API_URL=https://<service>.onrender.com/api`.

## Endpoints (all under `/api`, envelope `{success, data, message}`)
- `GET /health` · `POST /auth/register|login` · `GET|PUT /auth/profile`
- `GET /divisions`, `GET /divisions/{slug}` · `POST|PUT /divisions` (super admin)
- `GET|POST /categories` · `GET /products`, `GET /products/{slug}` · `POST|PUT|DELETE /products`
- `GET /rooms`, `GET /rooms/{slug}`, `GET /rooms/{id}/availability` · `POST|PUT|DELETE /rooms`
- `GET|POST /facilities`
- `GET|POST /bookings`, `GET|PUT /bookings/{id}`, `POST /bookings/{id}/cancel`
- `GET|POST /orders`, `GET|PUT /orders/{id}`
- `GET|POST|PUT|DELETE /users` (admin) · `GET|POST|DELETE /sales`
- `POST /upload/receipt` (JPG/PNG/WebP ≤8MB) · `GET /dashboard/stats` · `GET /settings`

## Roles
`super_admin` (all) · `division_admin` (own `division_id` only — enforced per endpoint) ·
`customer` (own records only). Demo logins (password `password`, change after login):
`admin@…`, `hotels@…`, `bakery@…`, `petrol@…`, `printing@…`, `hse@…`, `consult@…`.

## Payments
Transfer-only. Receipts upload to `/uploads/receipts/…`; admins confirm from
Orders/Bookings; **only `confirmed` payments count as revenue**.
