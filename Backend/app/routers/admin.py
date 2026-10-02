"""Users (admin), daily sales log, receipt uploads, dashboard stats, settings."""

from datetime import date

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import ensure_division, get_current_user, ok, require_roles
from app.core.security import hash_password
from app.db import get_db
from app.models import Booking, Cart, DailySale, Division, Order, User

router = APIRouter(tags=["admin"])


# ---------- Users ----------
@router.get("/users")
def list_users(db: Session = Depends(get_db), user: User = Depends(require_roles("super_admin", "division_admin"))):
    q = db.query(User)
    if user.role == "division_admin":
        q = q.filter((User.division_id == user.division_id) | (User.role.in_(["customer", "staff"])))
    return ok([u.to_dict() for u in q.all()])


@router.get("/users/{user_id}")
def get_user(user_id: str, db: Session = Depends(get_db),
             user: User = Depends(require_roles("super_admin", "division_admin"))):
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == "division_admin" and target.division_id != user.division_id and target.role not in ("customer", "staff"):
        raise HTTPException(status_code=403, detail="Forbidden")
    return ok(target.to_dict())


@router.post("/users")
def create_user(body: dict, db: Session = Depends(get_db),
                user: User = Depends(require_roles("super_admin", "division_admin"))):
    if db.query(User).filter(User.email == body.get("email")).first():
        raise HTTPException(status_code=422, detail="Email already registered")
    if body.get("role") == "division_admin" and user.role != "super_admin":
        raise HTTPException(status_code=403, detail="Only super admin may create division admins")
    if body.get("role") == "super_admin":
        raise HTTPException(status_code=403, detail="Super admins cannot be created here")
    new_user = User(
        first_name=body.get("firstName", body.get("first_name", "")),
        last_name=body.get("lastName", body.get("last_name", "")),
        email=body["email"], phone=body.get("phone"),
        password_hash=hash_password(body.get("password", "password123")),
        role=body.get("role", "customer"),
        division_id=body.get("divisionId", body.get("division_id"))
        if user.role == "super_admin" else user.division_id,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return ok(new_user.to_dict())


@router.put("/users/{user_id}")
def update_user(user_id: str, body: dict, db: Session = Depends(get_db),
                user: User = Depends(require_roles("super_admin", "division_admin"))):
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == "division_admin" and target.division_id != user.division_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    for key, col in (("firstName", "first_name"), ("lastName", "last_name"),
                     ("phone", "phone"), ("isActive", "is_active")):
        if key in body:
            setattr(target, col, body[key])
    db.commit()
    db.refresh(target)
    return ok(target.to_dict())


@router.delete("/users/{user_id}")
def delete_user(user_id: str, db: Session = Depends(get_db),
                user: User = Depends(require_roles("super_admin"))):
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(target)
    db.commit()
    return ok(None, "Deleted")


# ---------- Daily sales ----------
@router.get("/sales")
def list_sales(divisionId: str | None = None, db: Session = Depends(get_db),
               user: User = Depends(get_current_user)):
    q = db.query(DailySale).order_by(DailySale.date.desc())
    if user.role == "division_admin":
        q = q.filter(DailySale.division_id == user.division_id)
    elif divisionId:
        q = q.filter(DailySale.division_id == divisionId)
    return ok([s.to_dict() for s in q.all()])


@router.post("/sales")
def create_sale(body: dict, db: Session = Depends(get_db),
                user: User = Depends(require_roles("super_admin", "division_admin"))):
    div_id = user.division_id if user.role == "division_admin" else body.get("divisionId", body.get("division_id"))
    div = db.query(Division).filter(Division.id == div_id).first() if div_id else None
    sale = DailySale(
        division_id=div_id, division_name=div.name if div else None,
        date=date.fromisoformat(body["date"]), item=body["item"], amount=float(body["amount"]),
        entered_by=f"{user.first_name} {user.last_name}".strip(),
    )
    db.add(sale)
    db.commit()
    db.refresh(sale)
    return ok(sale.to_dict())


@router.delete("/sales/{sale_id}")
def delete_sale(sale_id: str, db: Session = Depends(get_db),
                user: User = Depends(require_roles("super_admin", "division_admin"))):
    sale = db.query(DailySale).filter(DailySale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Entry not found")
    ensure_division(user, sale.division_id)
    db.delete(sale)
    db.commit()
    return ok(None, "Deleted")


# ---------- Roaming cart (one per user, follows the account across devices) ----------
@router.get("/cart")
def get_cart(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    cart = db.get(Cart, user.id)
    if not cart:
        return ok({"items": [], "fulfillment": "pickup", "updatedAt": None})
    return ok(cart.to_dict())


@router.put("/cart")
def save_cart(body: dict, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    items = body.get("items", [])
    if not isinstance(items, list):
        raise HTTPException(status_code=422, detail="items must be a list")
    fulfillment = body.get("fulfillment", "pickup")
    if fulfillment not in ("pickup", "delivery"):
        raise HTTPException(status_code=422, detail="fulfillment must be pickup or delivery")
    cart = db.get(Cart, user.id)
    if not cart:
        cart = Cart(user_id=user.id, items=items, fulfillment=fulfillment)
        db.add(cart)
    else:
        cart.items, cart.fulfillment = items, fulfillment
    db.commit()
    db.refresh(cart)
    return ok(cart.to_dict())


# ---------- Receipt upload ----------
@router.post("/upload/receipt")
def upload_receipt(receipt: UploadFile = File(...), user: User = Depends(get_current_user)):
    import os
    import uuid
    from datetime import datetime

    if receipt.content_type not in ("image/jpeg", "image/png", "image/webp"):
        raise HTTPException(status_code=422, detail="Receipt must be JPG, PNG or WebP")
    data = receipt.file.read()
    if len(data) > 8 * 1024 * 1024:
        raise HTTPException(status_code=422, detail="Receipt too large (max 8MB)")
    ext = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}[receipt.content_type]
    folder = os.path.join(settings.upload_dir, "receipts", datetime.utcnow().strftime("%Y-%m"))
    os.makedirs(folder, exist_ok=True)
    name = f"{uuid.uuid4().hex}.{ext}"
    with open(os.path.join(folder, name), "wb") as f:
        f.write(data)
    return ok({"url": f"/{folder}/{name}".replace(os.sep, "/")})


# ---------- Dashboard ----------
@router.get("/dashboard/stats")
def dashboard_stats(db: Session = Depends(get_db),
                    user: User = Depends(require_roles("super_admin", "division_admin"))):
    div_id = None if user.role == "super_admin" else user.division_id
    orders = db.query(Order)
    bookings = db.query(Booking)
    sales = db.query(DailySale)
    if div_id:
        orders = orders.filter((Order.division_id == div_id) | (Order.division_id == "multiple"))
        bookings = bookings.filter(Booking.division_id == div_id)
        sales = sales.filter(DailySale.division_id == div_id)
    order_list, booking_list, sale_list = orders.all(), bookings.all(), sales.all()
    verified = [b for b in booking_list if b.status == "approved" and b.payment_status == "confirmed"]
    by_division = []
    if user.role == "super_admin":
        for d in db.query(Division).order_by(Division.sort_order).all():
            by_division.append({
                "divisionId": d.id, "division": d.name,
                "orders": sum(o.total for o in order_list if o.division_id == d.id),
                "bookings": sum(b.total for b in verified if b.division_id == d.id),
                "sales": sum(s.amount for s in sale_list if s.division_id == d.id),
            })
    return ok({
        "grand_total": sum(o.total for o in order_list) + sum(b.total for b in verified) + sum(s.amount for s in sale_list),
        "orders_revenue": sum(o.total for o in order_list),
        "orders_count": len(order_list),
        "bookings_revenue": sum(b.total for b in verified),
        "bookings_count": len(booking_list),
        "sales_revenue": sum(s.amount for s in sale_list),
        "sales_count": len(sale_list),
        "by_division": by_division,
    })


# ---------- Settings ----------
VENTURES_ACCOUNT = {
    "bank": "Guaranty Trust Bank (GTBank)",
    "accountNumber": "0123456789",
    "accountName": "University of Ibadan Ventures",
}


@router.get("/settings")
def get_settings():
    return ok({"account": VENTURES_ACCOUNT, "payments": ["transfer"]})
