"""Seed the database: `python -m app.seed` (re-runnable, skips existing rows).

Commits in dependency stages (divisions → categories/rooms → products →
facilities → users) so Postgres foreign keys always see their parents, and so
one bad row can't roll back everything that already succeeded.
"""

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.db import SessionLocal, init_db
from app.models import Category, Division, Facility, Product, Room, User
from app.seed_data import ADMINS, CATEGORIES, DIVISIONS, FACILITIES, PRODUCTS, ROOMS, ROOM_IMAGES, PRODUCT_IMAGES


def seed(db: Session) -> dict:
    counts: dict = {}

    added = 0
    for d in DIVISIONS:
        existing = db.get(Division, d["id"])
        if not existing:
            db.add(Division(**d))
            added += 1
        else:
            # Backfill branding added after the first seed.
            for field in ("banner_image", "icon", "short_description", "description"):
                if not getattr(existing, field) and d.get(field):
                    setattr(existing, field, d[field])
    db.commit()
    counts["divisions"] = db.query(Division).count()

    for c in CATEGORIES:
        if not db.get(Category, c["id"]):
            db.add(Category(**c))
    for r in ROOMS:
        existing = db.get(Room, r["id"])
        if not existing:
            db.add(Room(**r, images=ROOM_IMAGES.get(r["id"], []), available_rooms=r["total_rooms"]))
        elif not existing.images:
            existing.images = ROOM_IMAGES.get(r["id"], [])
    db.commit()
    counts["categories"] = db.query(Category).count()
    counts["rooms"] = db.query(Room).count()

    for pid, name, slug, price, sku, stock, featured in PRODUCTS:
        existing = db.get(Product, pid)
        if not existing:
            db.add(Product(
                id=pid, name=name, slug=slug, price=float(price), sku=sku, stock=stock,
                is_featured=featured, category_id="cat-bread" if "BRD" in sku else "cat-snacks",
                division_id="div-bakery",
                description=f"{name} — fresh from U.I. Bakery.",
                short_description=name, images=PRODUCT_IMAGES.get(pid, []), tags=[], specifications={},
            ))
        elif not existing.images and PRODUCT_IMAGES.get(pid):
            existing.images = PRODUCT_IMAGES[pid]
    for fid, name, slug, short, icon, req in FACILITIES:
        if not db.get(Facility, fid):
            db.add(Facility(id=fid, name=name, slug=slug, short_description=short,
                            icon=icon, requires_booking=req, division_id="div-hotels", images=[]))
    db.commit()
    counts["products"] = db.query(Product).count()
    counts["facilities"] = db.query(Facility).count()

    for email, first, last, role, div_id in ADMINS:
        if not db.query(User).filter(User.email == email).first():
            db.add(User(first_name=first, last_name=last, email=email,
                        password_hash=hash_password("password"), role=role, division_id=div_id))
    db.commit()
    counts["users"] = db.query(User).count()
    counts["added_divisions_this_run"] = added
    return counts


if __name__ == "__main__":
    init_db()
    db = SessionLocal()
    try:
        print(seed(db))
    finally:
        db.close()
