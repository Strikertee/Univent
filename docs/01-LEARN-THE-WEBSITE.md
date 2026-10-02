# Univent — Website Principles (Learn the System)

A plain-English guide to how the Univent marketplace works and why it was built this way.
For the project write-up and slide deck, see `02-WRITEUP-AND-PRESENTATION.md`.

---

## 1. What Univent is

One online shop for the **six business divisions** of University of Ibadan Ventures:

| # | Division | What it sells on the site |
|---|----------|---------------------------|
| 1 | U.I. Bakery / U & I Fast Food | Bread (sardine ₦1500, white ₦300/₦500/₦1000, wheat ₦1200) + snacks (meat pie, chicken pie, doughnuts, egg buns, sausage roll) |
| 2 | U.I. Petrol Station | Fuel, lubricants, car services (enquiry page) |
| 3 | U.I. Printing Press | Books, banners, branding (enquiry page) |
| 4 | U.I. Health, Safety & Environment | Fumigation, safety training (enquiry page) |
| 5 | U.I. Consultancy Services | Research & business consultancy (enquiry page) |
| 6 | U.I. Hotels | 6 room types (₦30,000–₦120,000/night) + facilities: pool, gym, restaurant, conference halls |

## 2. Core principles

### 2.1 One marketplace, many divisions (multi-division architecture)
Every product, room and order carries a `divisionId`. The site is **one codebase, one checkout**,
but data is always tagged to its division — so each division can later manage only its own items.
This is the same principle Jumia/Konga use for "sellers", except our sellers are the six divisions.

### 2.2 Role-Based Access Control (RBAC)
Three roles, three experiences:
- **Customer** — shops, books, pays, tracks orders/bookings, edits own cart. Never sees admin tools.
- **Division admin** — manages ONLY their division's products, rooms, orders, bookings.
- **Super admin** — sees and manages ALL six divisions, users and settings.
The frontend hides admin pages by role (`AdminRoute`), and the FastAPI backend re-checks the role on
every request — security is enforced on the server, not just in the browser.

### 2.3 Real data, no fakes (frontend-first persistence)
Until the FastAPI backend is connected, the site stores **real user-created data** in the browser's
`localStorage` (`src/store/shop.ts`):
- `univent_orders` — every completed payment
- `univent_bookings` — every submitted hotel booking
- `univent_cart` — the cart (survives refresh)
- `univent_checkout_draft` — delivery details between checkout steps
Customer pages AND admin pages read from the same store, so an order placed by a customer
instantly appears in Admin → Orders. No mock/hardcoded orders remain.

### 2.4 Cart → Checkout → Payment pipeline
1. **Cart** — add/edit/remove items anywhere (product cards, dashboard quick-shop, cart page).
2. **Checkout (`/checkout`)** — delivery details only (name, phone, address).
3. **Payment (`/payment`)** — transfer to the Ventures account → upload receipt →
   order saved with reference (`UI-XXXXXX`) → cart cleared → success screen → `/orders`.
Hotel booking is a parallel pipeline: room detail → booking form → booking saved (`BK-XXXXXX`) → `/bookings`.

### 2.5 Offline-first demo auth
`src/context/AuthContext.tsx` tries the real API first, then falls back to an offline demo session
so the site is fully testable without a backend. Roles are inferred from email:
`admin@…` → super admin, `hotels@…`/`bakery@…` → division admin, anything else → customer.
Demo sessions are never wiped by failed API calls (that was the old login-loop bug).

### 2.6 Trust by design (UI principles)
- **Navy blue + gold + white + black, zero gradients** — institutional, high-contrast theme.
- **Glow feedback** — every button and card glows on hover/click so users always see what is clickable.
- **Bromate-free story everywhere** — the bakery's health message (no bromate, low sugar,
  soya-fortified, 4–5 day natural shelf life) is repeated on product, story and home sections.
- **Reviews from the community** — testimonials from students, lecturers, staff and
  international guests on the home page and About page.

## 3. Tech map (where things live)

```
Frontend/src/
  pages/Home.tsx              landing + divisions + featured rooms/bakery
  pages/division/             division landing pages
  pages/hotel/                rooms list → room detail → booking form
  pages/bakery/               bread/snacks catalogue + product detail
  pages/cart|checkout|payment  cart → address → pay pipeline
  pages/dashboard/            customer hub: stats, divisions, quick-shop, cart editor
  pages/admin/                super/division admin panels (live data)
  pages/info/                 about, careers, press, blog, help, contact, FAQ, shipping,
                              returns, privacy, terms, cookies, accessibility
  pages/Management.tsx        leadership & division managers
  components/ui|layout|cart   reusable buttons, cards, header, footer, cart drawer
  context/                    AuthContext (login/session), CartContext (cart state)
  store/shop.ts               real orders/bookings in localStorage
  data/mockData.ts            catalogue content (divisions, rooms, products, facilities)
  services/api.ts             REST client — talks to the FastAPI backend when connected
Backend/
  app/main.py                 app factory, CORS, /api/health, routers
  app/models.py               10 tables + camelCase serializers
  app/routers/                auth, catalogue, bookings, orders, admin
  app/seed.py                 idempotent seed: divisions, catalogue, admins
```

## 4. How to extend it (common tasks)
- **Add a product:** `mockData.ts → bakeryProducts` (frontend) or `POST /api/products` (backend).
- **Add a division:** `mockData.ts → divisions` + `Backend/app/seed_data.py` + re-run `python -m app.seed`.
- **Go live with transfers:** the Ventures account lives in `src/data/account.ts`; on the
  backend, store receipts server-side and notify admins (SMS/email) the moment one lands.
- **Connect the backend:** set `VITE_API_URL` in `Frontend/.env`; check Admin → Settings —
  "API connected" means the FastAPI backend answers `/api/health`, "Demo mode" means the site is
  running on local data. Auth already tries the API first; catalogue/orders/bookings swap to API
  calls at the `store/*.ts` seam when the backend goes live.
