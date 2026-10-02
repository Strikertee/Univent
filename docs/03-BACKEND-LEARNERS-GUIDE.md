# Univent Backend — Learner's Guide (What Was Built & How)

> Status: **built, tested (7/7 pytest), and running.** Python + FastAPI + SQLAlchemy.
> Run it: `cd Backend && .\.venv\Scripts\python -m uvicorn app.main:app --port 8000`
> Docs: http://127.0.0.1:8000/docs (interactive Swagger UI — try every endpoint there).

---

## 1. Big picture: how the backend is organized

```
Backend/
  app/
    main.py            # app factory: CORS, /api/health, mounts all routers under /api
    db.py              # engine (SQLite local / Postgres on Render), sessions, init_db()
    models.py          # 10 tables as Python classes + to_dict() with camelCase keys
    seed_data.py       # the catalogue content (same ids/prices as the frontend)
    seed.py            # `python -m app.seed` — fills a fresh database
    core/
      config.py        # settings from env: DATABASE_URL, SECRET_KEY, FRONTEND_URL
      security.py      # bcrypt hashing + JWT tokens (like the old Sanctum idea)
      deps.py          # get_db, get_current_user, require_roles, ensure_division
    routers/           # one file per area — each function = one endpoint
      auth.py          # register / login / profile
      catalog.py       # divisions, categories, products, rooms, facilities
      bookings.py      # create/list/approve/cancel + room-number assignment
      orders.py        # create (server-side totals, stock decrement)/list/confirm
      admin.py         # users, daily sales, receipt upload, dashboard stats, settings
  tests/test_api.py    # 7 end-to-end tests (`pytest`) — see §5
  requirements.txt     # pinned Python packages
  render.yaml          # Render web service + Postgres database, one file
  .env.example         # config template
```

**Mental model:** Request → `main.py` router → (deps: logged in? right role? right division?) →
SQLAlchemy model → SQLite/Postgres → `{success, data, message}` JSON back to React.

---

## 2. What each piece does (and why)

### 2.1 Models — `app/models.py`
One class per table. IDs are UUID **strings**, and the seed reuses the frontend's ids
(`div-hotels`, `prod-sardine`, `room-double-deluxe`…) so a future frontend↔API swap is trivial.
`to_dict()` converts `snake_case` columns to the **camelCase** keys the React app expects
(`firstName`, `divisionId`, `roomNumber`…).

Rules mirrored from the frontend so both sides agree:
- `Room.held_count()` / availability — a booking holds a room only while
  `payment_status` is `awaiting_confirmation`/`confirmed` and status isn't `cancelled`.
- `Booking.roomNumber` — assigned server-side (`DD-04`, `RS-01`…) as lowest free number.
- Orders recompute totals from **DB prices** and decrement stock (never trust browser totals).

### 2.2 Auth — `core/security.py` + `routers/auth.py`
Register hashes passwords with **bcrypt** (never stored plain). Login verifies the hash
and returns a **JWT** (`{"user":…, "token":…}` — exactly what `services/api.ts` parses).
The frontend sends it back as `Authorization: Bearer <token>`; `get_current_user`
decodes it on every protected route. 401 = not logged in, 403 = wrong role/division.

### 2.3 Guards — `core/deps.py`
`require_roles("super_admin", "division_admin")` is the bouncer on admin routes;
`ensure_division(user, division_id)` is the second lock — bakery admin writing a hotel
room gets 403. (The pytest suite proves both directions.)

### 2.4 Routers
- `catalog.py` — public reads (`/divisions`, `/products`, `/rooms/{slug}`,
  `/rooms/{id}/availability`, `/facilities`); writes are role+division scoped.
- `bookings.py` — customers see only theirs; hotel admin sees the division's;
  creation validates dates, checks availability, assigns the room number.
- `orders.py` — receipt **required** (422 without it); stock decremented; division tagged.
- `admin.py` — users (only super admin creates division admins), daily sales log,
  `POST /upload/receipt` (JPG/PNG/WebP ≤8MB → `/uploads/...` URL),
  `/dashboard/stats` (grand total + per-division revenue, confirmed payments only),
  `/settings` (Ventures account).

### 2.5 Seed — `app/seed.py` + `seed_data.py`
Idempotent (re-runnable, skips existing rows): 6 divisions, 6 categories, 6 rooms,
11 products, 4 facilities, super admin + 6 division admins (`password` — change after login).

## 3. How a request flows (two examples)

**Customer books a room:**
`POST /api/bookings` (token) → validates dates → availability check →
`assign_room_number` → row created `pending`/`awaiting_confirmation` →
receipt uploaded → admin `PUT /api/bookings/{id}` → `approved`/`confirmed`.

**Hotel admin edits a price:**
`PUT /api/rooms/{id}` (token + `division_admin`) → `ensure_division(hotels)` →
update → every future `GET /rooms` returns the new price.

## 4. Testing & running
- `pytest tests/ -q` → 7 tests: health, catalogue, register→book→availability-drop,
  admin approve→revenue, cross-division 403s, receipt-required + stock decrement, sales scoping.
- Interactive docs at `/docs` when the server runs.
- SQLite file `univent.db` is created on first run; tests use a temp file and never touch it.

## 5. Deploying (Render)
`render.yaml` creates the web service (`pip install -r requirements.txt`,
`uvicorn app.main:app --host 0.0.0.0 --port $PORT`, health check `/api/health`)
plus a free Postgres DB wired as `DATABASE_URL`. Set `FRONTEND_URL` to the Vercel URL
for CORS, then point the frontend's `VITE_API_URL` at `https://<service>/api`.
Run `python -m app.seed` once via the Render shell.

## 6. Key terms glossary
- **FastAPI** — Python web framework; auto-generates `/docs`.
- **SQLAlchemy/ORM** — write Python, it writes SQL (works on SQLite AND Postgres).
- **JWT** — signed token proving "I'm logged in as X"; server verifies the signature.
- **bcrypt** — one-way password scrambling.
- **CORS** — which websites may call the API (localhost + your Vercel URL).
- **401 vs 403** — 401 "who are you?", 403 "not yours".
