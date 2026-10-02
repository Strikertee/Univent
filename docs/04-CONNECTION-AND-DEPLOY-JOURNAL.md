# Univent — Connection & Render Deployment Journal

*Everything we did getting the backend and frontend connected and hosted,
every error we hit, why it happened, and how it was fixed. Read this to learn it.*

---

## PART 1 — What we set out to do

1. Answer: **is the backend connected to the frontend?** → No. The frontend ran
   100% offline (localStorage + demo logins); the backend was scaffold-only.
2. Rewrite the backend in **Python + FastAPI** (Render has no PHP runtime, and this
   machine has Python but no PHP — so FastAPI could actually be built *and tested* here).
3. **Connect** the two (API-first sync with local fallback, nothing breaks offline).
4. **Host on Render**: Postgres → FastAPI web service → static frontend.

## PART 2 — What was built

- `Backend/` FastAPI app: JWT auth, catalogue, bookings (server-side room numbers),
  orders (server-side totals, stock decrement), daily sales, receipt uploads,
  division-scoped roles, dashboard stats, seed script, 7 pytest tests, `render.yaml`.
- Connection layer: `services/api.ts` (+`hasRealToken`, receipt uploader),
  `services/sync.ts` (probe + pull), `services/idmap.ts` (local→server id map),
  stores mirror writes to the API in the background; `AuthContext` pulls on boot/login.
- Rule that makes it all work: a **real JWT = API mode**, a `demo-` token = local mode.

## PART 3 — Problems, causes, fixes (the learning core)

| # | Error / symptom | Root cause | Fix & lesson |
|---|---|---|---|
| 1 | No PHP/Composer, 0.24 GB disk | Machine can't build Laravel at all | Chose FastAPI; freed 1.5 GB via `npm cache clean`. **Lesson: check toolchain + disk before promising a stack.** |
| 2 | `pip install` → `ENOSPC No space left` | pip cache + downloads filled the freed space | `pip cache purge` + retry with `--no-cache-dir`. **Lesson: package caches are invisible disk hogs.** |
| 3 | pytest fail: re-register same email → 422 | My own test called another test reusing a fixed email | Unique emails per test run. **Lesson: tests must be isolated/order-independent.** |
| 4 | pytest fail: `available == total - 1` got 13 | Earlier test's booking still held a room in the shared test DB | Assert *drop-by-one* from a before-reading instead of absolute math. **Lesson: assert deltas, not absolutes, on shared state.** |
| 5 | Background uvicorn died silently | Server was tied to a shell session that ended | Restarted; on Render the platform supervises the process. **Lesson: dev servers need a process manager.** |
| 6 | Kill port 8000 hit "Idle (0)" | Stale socket owner PID confused the lookup | Verified via fresh boot + `/api/health` instead of fighting PIDs. |
| 7 | `tsc` explodes on `sync.ts` line 1 | I wrote a Python `"""docstring"""` in TypeScript | `/* */` comments in TS. **Lesson: context-switching languages causes silly bugs — the compiler is your friend.** |
| 8 | Render crash: `ModuleNotFoundError: No module named 'psycopg2'` | SQLite needs no driver, so local tests passed without one; Postgres does | Added `psycopg2-binary` to requirements. **Lesson: green locally ≠ green in prod — different DB, different deps.** |
| 9 | `/api/divisions` → `[]` (empty DB) | Free Render plan has **no Shell tab**, so `python -m app.seed` couldn't run | App now **self-seeds on startup** (idempotent). **Lesson: design for the limits of your hosting tier.** |
| 10 | Settings badge: "Demo mode" + `/health 404` | `VITE_API_URL` was `https://…onrender.com` without `/api` | Correct value ends in `/api`. **Lesson: read the failing URL — it told us exactly what was wrong.** |
| 11 | Same badge after fixing the URL | Vite bakes env vars in **at build time** | **Manual Deploy → Clear build cache & deploy.** Saving the variable alone does nothing. |
| 12 | `blocked by CORS policy` | Backend `FRONTEND_URL` didn't list the frontend origin | Set it to the exact frontend URL (no trailing slash), redeploy backend. **Lesson: CORS errors name the missing origin — compare both sides.** |
| 13 | Frontend calling *itself* (`/api` 404 on the static URL) | `VITE_API_URL` was set to the *frontend's* URL instead of the backend's | Two services, two URLs — don't cross them. |
| 14 | Refresh any page → **Not Found** | SPA routes exist only in JS; the static server looks for real files | **Rewrite** rule `/* → /index.html` (status 200, not redirect) in Render dashboard. **Lesson: every SPA host needs this fallback.** |
| 15 | Backend 503 right after deploy | Free service asleep or mid-deploy | Warm it via `/api/health` (~60 s wake), then hard-refresh (`Ctrl+Shift+R`). |

## PART 4 — Render hosting steps (exact recipe)

**Step 1 — Postgres:** New → PostgreSQL, name `univent-db`, region **Frankfurt (EU Central)**
(closest to Nigeria; backend must share it), leave DB/user/Datadog blank. Wait for
**Available** → copy the **Internal Database URL**.

**Step 2 — Backend (Web Service, Python 3):** Root `Backend`,
build `pip install -r requirements.txt`,
start `uvicorn app.main:app --host 0.0.0.0 --port $PORT`, health check `/api/health`.
Env: `DATABASE_URL` (internal URL), `SECRET_KEY` (Generate), `FRONTEND_URL`
(frontend URL, no trailing slash), `PYTHON_VERSION=3.12.1`.
Verify `…/api/health` → `{"success":true}`; DB self-seeds on first boot.

**Step 3 — Frontend (Static Site):** Root `Frontend`, build `npm install && npm run build`,
publish `dist`, env `VITE_API_URL=https://<backend>.onrender.com/api`.
Add rewrite `/* → /index.html` (200). Verify: log in → Admin → Settings → **"API connected"**.

## PART 5 — Free-plan caveats (know these cold)
- Web services **sleep** when idle → first hit takes ~60 s. Warm up before demos.
- Free **Postgres expires after 30 days, data deleted**. Back up or upgrade ($6/mo) before it matters.
- No **Shell** on free tier → that's why seeding is automatic.
- `demo-` tokens always stay local; only real JWT logins use the API (by design).

## PART 6 — Principles to take away
1. Error messages are diagnoses — read the URL, the status code, the missing module name.
2. Reproduce locally first (`pytest`, `tsc`, `curl`) before blaming hosting.
3. Offline-first design (local write + background mirror) makes outages non-events.
4. Bake-time vs run-time config (Vite env) bites everyone exactly once.
5. Same-region services + internal URLs = free, fast, private traffic.
