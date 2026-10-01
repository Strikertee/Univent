# Univent — University of Ibadan Ventures Marketplace

Full-stack multi-division marketplace.

## Stack
- **Frontend:** React + TypeScript + Vite + Tailwind + shadcn/ui + Framer Motion + React Router + Zustand-style Context + Axios
- **Backend:** Laravel 11 (PHP) + Sanctum + MySQL + REST
- **Payments:** Paystack / Flutterwave / Bank Transfer

## Structure
```
Frontend/               # Vite app (port 3000)
  src/pages/Home.tsx    # landing + divisions + hotel + bakery highlights
  src/pages/hotel/      # rooms list, room detail (capacity etc), booking form submit
  src/pages/bakery/     # bread/snacks with history + wholesale note
  src/pages/admin/      # super admin (all) + division admin (scoped)
  src/data/mockData.ts  # all 6 rooms, 11 bakery SKUs, facilities, divisions
Backend/                # Laravel API (port 8000)
  routes/api.php
  app/Http/Controllers/Api/
  database/schema.sql   # full MySQL + seeds
```

## Run frontend (no backend needed — uses mock data + demo auth)
```bash
cd Frontend
npm install
cp .env.example .env
npm run dev
```
- Home: `/`
- Hotels: `/division/hotels/rooms` → click **Book Now!** → detail → enter details → submit
- Bakery: `/division/bakery-fastfood/products`
- Login demo super admin: `admin@univent.ui.edu.ng` / `password` → `/admin`

## Run backend
See `Backend/README.md`.

## Divisions
1. U.I. Bakery / U & I Fast Food (`bakery-fastfood`)
2. U.I. Petrol Station (`petrol-station`)
3. U.I. Printing Press (`printing-press`)
4. U.I. Health, Safety and Environment (`health-safety`)
5. U.I. Consultancy Services (`consultancy`)
6. U.I. Hotels (`hotels`)
