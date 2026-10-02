"""Seed the database: `python -m app.seed` (re-runnable, skips existing rows)."""

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.db import SessionLocal, init_db
from app.models import Category, Division, Facility, Product, Room, User
from app.seed_data import ADMINS, CATEGORIES, DIVISIONS, FACILITIES, PRODUCTS, ROOMS


def seed(db: Session) -> None:
    for d in DIVISIONS:
        if not db.get(Division, d["id"]):
            db.add(Division(**d))
    for c in CATEGORIES:
        if not db.get(Category, c["id"]):
            db.add(Category(**c))
    for r in ROOMS:
        if not db.get(Room, r["id"]):
            db.add(Room(**r, available_rooms=r["total_rooms"]))
    for pid, name, slug, price, sku, stock, featured in PRODUCTS:
        if not db.get(Product, pid):
            db.add(Product(
                id=pid, name=name, slug=slug, price=float(price), sku=sku, stock=stock,
                is_featured=featured, category_id="cat-bread" if "BRD" in sku else "cat-snacks",
                division_id="div-bakery",
                description=f"{name} — fresh from U.I. Bakery.",
                short_description=name, images=[], tags=[], specifications={},
            ))
    for fid, name, slug, short, icon, req in FACILITIES:
        if not db.get(Facility, fid):
            db.add(Facility(id=fid, name=name, slug=slug, short_description=short,
                            icon=icon, requires_booking=req, division_id="div-hotels", images=[]))
    for email, first, last, role, div_id in ADMINS:
        if not db.query(User).filter(User.email == email).first():
            db.add(User(first_name=first, last_name=last, email=email,
                        password_hash=hash_password("password"), role=role, division_id=div_id))
    db.commit()


if __name__ == "__main__":
    init_db()
    db = SessionLocal()
    try:
        seed(db)
        print("Seed complete: divisions, catalogue, facilities, admins.")
    finally:
        db.close()
