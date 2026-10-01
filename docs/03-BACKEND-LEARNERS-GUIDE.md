# Univent Backend — Learner's Guide (What Was Built & How)

> Honest status first: the backend is **API-complete on paper** (models, controllers,
> routes, middleware, database schema) but **not yet runnable or connected** — it still
> needs a Laravel app shell, and the frontend still reads local data. This guide explains
> every piece, how they fit, and exactly what remains. For setup steps, see `Backend/README.md`.

---

## 1. Big picture: how the backend is organized

```
Backend/
  app/
    Models/            # PHP classes = database tables (Eloquent ORM)
      User.php         # people: customers, admins, staff
      Division.php     # the 6 ventures
      Category.php     # e.g. "Bread", "Snacks", "Standard rooms"
      Product.php      # bakery items
      Room.php         # hotel rooms (+ live availability math)
      Facility.php     # pool, gym, conference hall...
      Booking.php      # hotel reservations (+ holdsRoom rule)
      Order.php        # shop payments
      OrderItem.php    # lines inside an order
      DailySale.php    # daily sales log per division
    Http/
      Controllers/Api/ # functions behind each URL (the "waiters")
      Middleware/
        CheckRole.php  # the "bouncer": only lets listed roles through
  routes/
    api.php            # the menu: which URL → which controller function
  database/
    schema.sql         # the full MySQL blueprint: tables + seed data
  composer.json        # PHP dependencies (Laravel, Sanctum)
  .env.example         # config template (DB name, payment keys)
```

**Mental model:** Request → `routes/api.php` → (middleware: logged in? right role?) →
controller function → Eloquent model → MySQL → JSON back to the React frontend.

---

## 2. What each piece does (and why)

### 2.1 Models — `app/Models/`
A model is a PHP class mapped to one table. `HasUuids` means new rows get IDs like
`a3f9-…` automatically. `$fillable` is a security list: only these fields may be
mass-assigned from request data (prevents attackers injecting e.g. `role=super_admin`).
`$casts` converts JSON columns to PHP arrays automatically.

Special methods that mirror frontend rules (so both sides agree):
- `Room::availableNow()` — `total_rooms − active bookings`. Same math as the
  frontend's `getAvailableRooms()`.
- `Booking::holdsRoom()` — true only when payment is `awaiting_confirmation` or
  `confirmed` and status isn't `cancelled`. Reversed/failed payments free the room.
- `User::managesDivision($id)` — true for super admins, or division admins whose
  `division_id` matches. Controllers call this before every write.

### 2.2 Middleware — `CheckRole.php`
A bouncer on routes: `->middleware('role:super_admin,division_admin')` rejects anyone
else with HTTP 403. It checks the *role*, then controllers check the *division*.
Two layers: role says "are you staff?", division check says "is it YOUR division?".

### 2.3 Controllers — `app/Http/Controllers/Api/`
Each public function = one endpoint's job:
- `AuthController` — register (hashes password with bcrypt, never stored plain),
  login (checks hash, issues Sanctum token), logout, profile.
- `DivisionController` — list/show for everyone; only super admin can create;
  division admins may edit **only their own** division (403 otherwise).
- `ProductController` / `RoomController` / `FacilityController` / `CategoryController`
  — same scoping pattern: bakery admin writes bakery rows, hotel admin writes hotel rows.
- `BookingController::store` — validates dates (`check_out` after `check_in`),
  computes nights × price, creates the booking as `pending`.
- `OrderController::store` — computes subtotal/tax/shipping server-side
  (never trust totals sent by the browser), saves items, tags `division_id`.
- `UserController` — only super admin may *create* division admins; division admins
  can only see customers/staff of their division.
- `DailySaleController` — division admins auto-tagged to their own division.
- `DashboardController::stats` — grand total + per-division revenue; **only
  `approved`+`confirmed` bookings count** (same rule as the frontend analytics).
- `UploadController::receipt` — validates the file is an image ≤8MB, stores it under
  `storage/app/public/receipts/2026-10/`, returns a public URL saved on the order/booking.

### 2.4 Routes — `routes/api.php`
Three blocks: **public** (register, login, catalogue browsing, `/health`),
**authenticated** (`auth:sanctum` — bookings, orders, receipt upload, sales),
**admin** (`role:...` — everything managerial). The frontend's `Settings` page pings
`GET /api/health` to display "API connected" vs "Demo mode".

### 2.5 Database — `database/schema.sql`
Every table with UUID primary keys, foreign keys (`division_id`, `user_id`…), JSON
columns for images/addresses, plus seed rows for the 6 divisions and a super admin
(`admin@univent.ui.edu.ng` / `password` — **change after first login**).
Later additions are `ALTER TABLE` blocks at the bottom (receipt columns, `daily_sales`).

---

## 3. How a request flows (two examples)

**Customer books a room:**
`POST /api/bookings` (token) → `BookingController::store` validates →
`Room::findOrFail` → nights × price computed → `Booking::create(status: pending)` →
frontend assigns room number, customer uploads receipt → admin confirms →
`PUT /api/bookings/{id}` sets `approved`/`confirmed`.

**Hotel admin edits a price:**
`PUT /api/rooms/{id}` (token, `role` middleware) → controller loads room →
`managesDivision($room->division_id)`? hotel admin + hotel room → allowed →
update → frontend re-fetches and every price on the site changes.

## 4. What is NOT done yet (be honest in your presentation)
1. No runnable Laravel shell — needs `composer create-project laravel/laravel` + copying these files in.
2. No migrations/seeders (raw `schema.sql` instead) and no automated tests.
3. Frontend still uses browser storage; `store/*.ts` must be swapped to `api.ts` calls.
4. Receipts stored locally in demo; production needs `storage:link` + backups.
5. No email/SMS notifications on confirm, no rate limiting, no audit log.

## 5. Key terms glossary
- **Eloquent/ORM** — write PHP, it writes SQL for you.
- **Sanctum token** — a secret string proving "I'm logged in as X" on each request.
- **Middleware** — code that runs before the controller (auth, roles).
- **bcrypt** — one-way password scrambling; stolen hashes can't be reversed.
- **`$fillable`** — whitelist against mass-assignment attacks.
- **403 vs 401** — 401 "who are you?" (not logged in), 403 "not yours" (wrong role/division).
