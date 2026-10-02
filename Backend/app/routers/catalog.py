"""Divisions, categories, products, rooms, facilities — public reads, scoped writes."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import ensure_division, get_current_user, ok, require_roles
from app.db import get_db
from app.models import Booking, Category, Division, Facility, Product, Room, User

router = APIRouter(tags=["catalogue"])


# ---------- Divisions ----------
@router.get("/divisions")
def list_divisions(db: Session = Depends(get_db)):
    divs = db.query(Division).filter(Division.is_active == True).order_by(Division.sort_order).all()  # noqa: E712
    return ok([d.to_dict() for d in divs])


@router.get("/divisions/{slug}")
def get_division(slug: str, db: Session = Depends(get_db)):
    div = db.query(Division).filter(Division.slug == slug).first()
    if not div:
        raise HTTPException(status_code=404, detail="Division not found")
    return ok(div.to_dict())


@router.post("/divisions")
def create_division(body: dict, db: Session = Depends(get_db), user: User = Depends(require_roles("super_admin"))):
    if db.query(Division).filter(Division.slug == body.get("slug")).first():
        raise HTTPException(status_code=422, detail="Slug already exists")
    div = Division(name=body["name"], slug=body["slug"], description=body.get("description", ""))
    db.add(div)
    db.commit()
    db.refresh(div)
    return ok(div.to_dict())


@router.put("/divisions/{div_id}")
def update_division(div_id: str, body: dict, db: Session = Depends(get_db),
                    user: User = Depends(require_roles("super_admin", "division_admin"))):
    div = db.query(Division).filter(Division.id == div_id).first()
    if not div:
        raise HTTPException(status_code=404, detail="Division not found")
    ensure_division(user, div.id)
    for field in ("name", "description", "short_description", "banner_image", "icon"):
        if field in body:
            setattr(div, field, body[field])
    db.commit()
    db.refresh(div)
    return ok(div.to_dict())


# ---------- Categories ----------
@router.get("/categories")
def list_categories(divisionId: str | None = None, db: Session = Depends(get_db)):
    q = db.query(Category).filter(Category.is_active == True)  # noqa: E712
    if divisionId:
        q = q.filter(Category.division_id == divisionId)
    return ok([c.to_dict() for c in q.order_by(Category.sort_order).all()])


@router.post("/categories")
def create_category(body: dict, db: Session = Depends(get_db),
                    user: User = Depends(require_roles("super_admin", "division_admin"))):
    ensure_division(user, body.get("division_id"))
    cat = Category(name=body["name"], slug=body.get("slug", body["name"].lower().replace(" ", "-")),
                   division_id=body["division_id"], description=body.get("description"))
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return ok(cat.to_dict())


# ---------- Products ----------
@router.get("/products")
def list_products(divisionId: str | None = None, search: str | None = None, db: Session = Depends(get_db)):
    q = db.query(Product).filter(Product.is_active == True)  # noqa: E712
    if divisionId:
        q = q.filter(Product.division_id == divisionId)
    if search:
        q = q.filter(Product.name.ilike(f"%{search}%"))
    return ok([p.to_dict() for p in q.all()])


@router.get("/products/{slug}")
def get_product(slug: str, db: Session = Depends(get_db)):
    prod = db.query(Product).filter(Product.slug == slug).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    return ok(prod.to_dict())


@router.post("/products")
def create_product(body: dict, db: Session = Depends(get_db),
                   user: User = Depends(require_roles("super_admin", "division_admin"))):
    ensure_division(user, body.get("division_id"))
    prod = Product(
        name=body["name"], slug=body["slug"], price=float(body["price"]),
        category_id=body["category_id"], division_id=body["division_id"],
        description=body.get("description"), short_description=body.get("shortDescription"),
        stock=int(body.get("stock", 0)), images=body.get("images", []),
    )
    db.add(prod)
    db.commit()
    db.refresh(prod)
    return ok(prod.to_dict())


@router.put("/products/{prod_id}")
def update_product(prod_id: str, body: dict, db: Session = Depends(get_db),
                   user: User = Depends(require_roles("super_admin", "division_admin"))):
    prod = db.query(Product).filter(Product.id == prod_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    ensure_division(user, prod.division_id)
    mapping = {"name": "name", "price": "price", "stock": "stock", "isActive": "is_active",
               "is_active": "is_active", "description": "description", "images": "images"}
    for key, col in mapping.items():
        if key in body:
            setattr(prod, col, body[key])
    db.commit()
    db.refresh(prod)
    return ok(prod.to_dict())


@router.delete("/products/{prod_id}")
def delete_product(prod_id: str, db: Session = Depends(get_db),
                   user: User = Depends(require_roles("super_admin", "division_admin"))):
    prod = db.query(Product).filter(Product.id == prod_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    ensure_division(user, prod.division_id)
    db.delete(prod)
    db.commit()
    return ok(None, "Deleted")


# ---------- Rooms ----------
@router.get("/rooms")
def list_rooms(divisionId: str | None = None, search: str | None = None,
               maxPrice: float | None = None, db: Session = Depends(get_db)):
    q = db.query(Room).filter(Room.is_active == True)  # noqa: E712
    if divisionId:
        q = q.filter(Room.division_id == divisionId)
    if search:
        q = q.filter(Room.name.ilike(f"%{search}%"))
    if maxPrice:
        q = q.filter(Room.price <= maxPrice)
    return ok([r.to_dict(db) for r in q.all()])


@router.get("/rooms/{slug}")
def get_room(slug: str, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.slug == slug).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return ok(room.to_dict(db))


@router.get("/rooms/{room_id}/availability")
def room_availability(room_id: str, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return ok({"available": max(0, room.total_rooms - room.held_count(db)), "total": room.total_rooms})


@router.post("/rooms")
def create_room(body: dict, db: Session = Depends(get_db),
                user: User = Depends(require_roles("super_admin", "division_admin"))):
    ensure_division(user, body.get("division_id"))
    room = Room(name=body["name"], slug=body["slug"], price=float(body["price"]),
                category_id=body["category_id"], division_id=body["division_id"],
                capacity=int(body.get("capacity", 2)), total_rooms=int(body.get("totalRooms", 1)),
                available_rooms=int(body.get("totalRooms", 1)))
    db.add(room)
    db.commit()
    db.refresh(room)
    return ok(room.to_dict(db))


@router.put("/rooms/{room_id}")
def update_room(room_id: str, body: dict, db: Session = Depends(get_db),
                user: User = Depends(require_roles("super_admin", "division_admin"))):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    ensure_division(user, room.division_id)
    mapping = {"name": "name", "price": "price", "totalRooms": "total_rooms",
               "total_rooms": "total_rooms", "capacity": "capacity", "isActive": "is_active"}
    for key, col in mapping.items():
        if key in body:
            setattr(room, col, body[key])
    db.commit()
    db.refresh(room)
    return ok(room.to_dict(db))


@router.delete("/rooms/{room_id}")
def delete_room(room_id: str, db: Session = Depends(get_db),
                user: User = Depends(require_roles("super_admin", "division_admin"))):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    ensure_division(user, room.division_id)
    db.delete(room)
    db.commit()
    return ok(None, "Deleted")


# ---------- Facilities ----------
@router.get("/facilities")
def list_facilities(divisionId: str | None = None, db: Session = Depends(get_db)):
    q = db.query(Facility).filter(Facility.is_active == True)  # noqa: E712
    if divisionId:
        q = q.filter(Facility.division_id == divisionId)
    return ok([f.to_dict() for f in q.all()])


@router.post("/facilities")
def create_facility(body: dict, db: Session = Depends(get_db),
                    user: User = Depends(require_roles("super_admin", "division_admin"))):
    ensure_division(user, body.get("division_id"))
    fac = Facility(name=body["name"], slug=body.get("slug", body["name"].lower().replace(" ", "-")),
                   division_id=body["division_id"], description=body.get("description"),
                   icon=body.get("icon"))
    db.add(fac)
    db.commit()
    db.refresh(fac)
    return ok(fac.to_dict())
