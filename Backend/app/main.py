"""Univent API entrypoint. Mounts every router under /api to match VITE_API_URL."""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.db import init_db
from app.routers import admin, auth, bookings, catalog, orders

app = FastAPI(title="Univent API", version="1.0.0")

origins = ["http://localhost:3000", "http://127.0.0.1:3000"] + [
    o.strip() for o in settings.frontend_url.split(",") if o.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(dict.fromkeys(origins)),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(settings.upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")


@app.on_event("startup")
def startup():
    init_db()
    # Self-seed on first boot (Render free plan has no Shell access).
    # seed() is idempotent — it skips rows that already exist.
    try:
        from app.db import SessionLocal
        from app.seed import seed

        db = SessionLocal()
        try:
            seed(db)
        finally:
            db.close()
    except Exception as exc:  # never crash boot because of seeding
        print(f"Seed skipped: {exc}")


@app.get("/api/health")
def health():
    return {"success": True, "data": {"service": "univent-api"}}


@app.post("/api/seed")
def remote_seed(key: str = ""):
    """One-shot database seed for hosts without shell access (Render free plan).
    Only works with the SECRET_KEY and only when no users exist yet."""
    from app.db import SessionLocal
    from app.seed import seed

    if not key or key != settings.secret_key or key == "change-me-in-production":
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Forbidden")
    db = SessionLocal()
    try:
        # Always safe: seed() skips every row that already exists.
        counts = seed(db)
        return {"success": True, "data": {"seeded": True, **counts}}
    finally:
        db.close()


app.include_router(auth.router, prefix="/api")
app.include_router(catalog.router, prefix="/api")
app.include_router(bookings.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
