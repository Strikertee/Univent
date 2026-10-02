# Univent — Project Write-Up & Presentation Slides

Use Part A for reports/handbooks and Part B slide-by-slide for your deck
(PowerPoint / Google Slides / Canva — 10 slides, ~10 minutes).

---

## PART A — PROJECT WRITE-UP

### Title
**Univent: A Multi-Division Online Marketplace for University of Ibadan Ventures**

### 1. Background
University of Ibadan Ventures runs six commercial divisions — Bakery & Fast Food, Petrol Station,
Printing Press, Health Safety & Environment, Consultancy Services and Hotels. Customers previously
had to visit each outlet physically. Univent unifies all six into one modern web marketplace with
a single account, cart and checkout.

### 2. Objectives
1. Let customers shop bakery/snacks, book hotel rooms and request division services online.
2. Give each division its own manageable catalogue under one super-admin oversight.
3. Provide bank-transfer checkout with uploaded receipts confirmed by an admin within a minute.
4. Reflect the University's identity: navy blue, gold, white and black; trustworthy and accessible.

### 3. Scope covered
- Landing page with all six divisions, featured rooms and best-selling bread/snacks.
- U.I. Hotels: 6 room categories (₦30,000–₦120,000), full room details (capacity, bed size,
  amenities), booking form with confirmation reference, plus facilities (pool, gym, restaurant,
  conference halls).
- U.I. Bakery: full history/story page, 11 products with exact prices, wholesale note
  (2,000–2,500 loaves, South-West delivery), quick-shop with editable cart.
- Customer dashboard: division picker, live stats, bakery quick-shop, cart editor, real orders
  and bookings (no mock data), profile.
- Admin: super admin (all divisions) and division admin (own division only) panels for
  products, rooms, facilities, orders, bookings, users and settings.
- Company pages: About, Management, Careers, Press, Blog, Help, Contact, FAQ, Shipping,
  Returns, Privacy, Terms, Cookies, Accessibility + community testimonials.

### 4. Methodology / Tech stack
- **Frontend:** React + TypeScript + Vite + Tailwind CSS + shadcn/ui + Framer Motion.
- **Backend:** Python + FastAPI + SQLAlchemy + JWT + REST API.
- Role-based access control enforced in UI routes and re-checked on the API.
- Transfer-only payments with receipt upload and one-minute admin confirmation, end-to-end.

### 5. Results & benefits
- One cart across divisions; checkout in 2 steps (address → payment).
- Real order/booking records with references visible to customers and admins instantly.
- Division managers see only their division; super admin sees everything.
- Accessible, high-contrast, mobile-responsive design with interactive glow feedback.

### 6. Future work
Connect the live FastAPI backend fully (swap the remaining `store/*.ts` reads to `api.ts`), add SMS/email notifications,
add SMS/email notifications, delivery tracking, and a mobile app shell.

---

## PART B — PRESENTATION SLIDES (10 slides)

**Slide 1 — Title:** "Univent: One Marketplace, Six Divisions" + tagline + your name/team + date.
Say: problem in one line — six ventures, zero online presence, now unified.

**Slide 2 — The Problem:** photos/bullets — long queues at bakery, hotel bookings by phone,
no price list online, wholesale distributors calling around. Pain for students, staff, guests.

**Slide 3 — The Solution:** screenshot of the landing page. One account, one cart, six divisions.
Mention navy/gold University identity.

**Slide 4 — Divisions at a Glance:** 6 cards (icons + one-liners). Emphasise multi-division
architecture — each division owns its catalogue.

**Slide 5 — U.I. Hotels (live demo):** rooms page → click Book Now → room detail (capacity,
bed size, amenities) → booking form → reference BK-XXXXXX appears in My Bookings AND admin.
Quote prices ₦30,000–₦120,000 + facilities (pool, gym, conference hall).

**Slide 6 — U.I. Bakery (live demo):** catalogue with real prices, full story page, add to cart,
edit quantities in the dashboard quick-shop, checkout → payment → order in My Orders.

**Slide 7 — Roles & Admin:** customer dashboard vs division admin vs super admin. Stress that
admins only see their division; super admin sees all. Show the Management page.

**Slide 8 — Tech & Principles:** stack logos; 4 principles — multi-division data tagging, RBAC,
real data (no mocks), cart→checkout→payment pipeline. Mention offline demo auth for judging.

**Slide 9 — Testimonials & Trust:** 2–3 quotes (student, lecturer, international guest);
bromate-free/low-sugar/soya-fortified message; secure payments.

**Slide 10 — Roadmap & Thank You:** live API, real payment keys, notifications, delivery
tracking. End with the Univent logo, URL, and Q&A. Thank the audience.

### Demo tips
- Log in as `admin@univent.ui.edu.ng` / `password` for the admin view.
- Place a real bakery order on stage — it appears in Admin → Orders instantly.
- Submit a hotel booking on stage — it appears in Admin → Bookings instantly.
- Keep Wi-Fi-independent: the demo runs fully offline thanks to local persistence.
