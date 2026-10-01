# Univent Backend (Laravel 11 + Sanctum + MySQL)

Multi-division marketplace API for University of Ibadan Ventures.

## Roles
- `super_admin` — oversees all 6 divisions (full access)
- `division_admin` — scoped to `division_id` (enforced by `role` middleware + controllers)
- `customer` — shop / book
- `staff` — read-only support

## Quick start
```bash
# 1. Fresh Laravel shell, then drop these files in:
composer create-project laravel/laravel backend
cd backend
composer require laravel/sanctum
# copy app/, routes/, database/ from this folder over the fresh install

# 2. Register the role middleware alias in bootstrap/app.php:
#   ->withMiddleware(function (Middleware $middleware) {
#       $middleware->alias(['role' => \App\Http\Middleware\CheckRole::class]);
#   })

# 3. Database
cp .env.example .env
mysql -u root -p -e "CREATE DATABASE univent"
mysql -u root -p univent < database/schema.sql
php artisan key:generate
php artisan storage:link   # exposes uploaded transfer receipts at /storage

# 4. Serve
php artisan serve --port=8000
```
Frontend expects API at `http://localhost:8000/api` (see `Frontend/.env.example` → `VITE_API_URL`).
Check `GET /api/health` returns `{"success":true}` — the frontend Settings page shows
"API connected" vs "Demo mode" from this endpoint.

## Divisions seeded
- bakery-fastfood, petrol-station, printing-press, health-safety, consultancy, hotels

## Demo accounts
- Super admin: `admin@univent.ui.edu.ng` / `password` (change after first login)
- Create division admins via `POST /api/users` with `{ role: division_admin, division_id }`

## Payments
Transfer-only. Customers upload receipt photos to `POST /api/upload/receipt`
(stored under `storage/app/public/receipts`); admins confirm from Orders / Bookings,
which flips `payment_status` to `confirmed`. Only confirmed payments count as revenue.
