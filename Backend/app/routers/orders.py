"""Orders: transfer + receipt flow. Totals recomputed server-side (never trusted)."""

import json
import random
import string

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.deps import ensure_division, get_current_user, ok, require_roles
from app.db import get_db
from app.models import Order, OrderItem, Product, User
from app.receipts import save_receipt_file

router = APIRouter(prefix="/orders", tags=["orders"])

DELIVERY_FEE = 550.0


def make_ref() -> str:
    return f"UI-{''.join(random.choices(string.digits, k=6))}"


@router.get("")
def list_orders(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = db.query(Order).order_by(Order.created_at.desc())
    if user.role == "customer":
        q = q.filter(Order.user_id == user.id)
    elif user.role == "division_admin":
        q = q.filter((Order.division_id == user.division_id) | (Order.division_id == "multiple"))
    return ok([o.to_dict() for o in q.all()])


@router.get("/{order_id}")
def get_order(order_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if user.role == "customer" and order.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not your order")
    if user.role == "division_admin" and order.division_id not in (user.division_id, "multiple"):
        raise HTTPException(status_code=403, detail="Not your division")
    return ok(order.to_dict())


@router.post("")
async def create_order(request: Request, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Accepts EITHER multipart (fields + receipt FILE in one request — atomic)
    OR plain JSON (with a receipt URL from POST /upload/receipt)."""
    content_type = request.headers.get("content-type", "")
    if content_type.startswith("multipart/"):
        form = await request.form()
        try:
            body = {
                "items": json.loads(form.get("items", "[]")),
                "divisionId": form.get("divisionId"),
                "fulfillment": form.get("fulfillment", "pickup"),
                "shippingAddress": json.loads(form.get("shippingAddress", "{}")),
                "billingAddress": json.loads(form.get("billingAddress") or form.get("shippingAddress", "{}")),
                "ref": form.get("ref"),
                "notes": form.get("notes"),
            }
        except (ValueError, TypeError):
            raise HTTPException(status_code=422, detail="Malformed multipart fields")
        receipt_file = form.get("receipt_file")
        receipt_url = save_receipt_file(receipt_file) if receipt_file else None
    else:
        body = await request.json()
        receipt_url = body.get("receipt")

    items = body.get("items", [])
    if not items:
        raise HTTPException(status_code=422, detail="Order needs at least one item")
    if not receipt_url:
        raise HTTPException(status_code=422, detail="Transfer receipt is required")

    # Recompute lines from DB prices (products); room lines carry their stay total.
    subtotal = 0.0
    divisions = set()
    lines = []
    for it in items:
        qty = max(1, int(it.get("quantity", 1)))
        if it.get("type") == "product" and it.get("productId"):
            prod = db.query(Product).filter(Product.id == it["productId"]).first()
            if not prod or not prod.is_active:
                raise HTTPException(status_code=422, detail=f"Product unavailable: {it.get('name')}")
            # ATOMIC stock guard: decrement only if enough remains. Concurrent
            # buyers of the last unit can't both pass — exactly one wins.
            won = (
                db.query(Product)
                .filter(Product.id == prod.id, Product.stock >= qty)
                .update({Product.stock: Product.stock - qty}, synchronize_session="evaluate")
            )
            if not won:
                db.rollback()
                raise HTTPException(status_code=422, detail=f"Only {prod.stock} of {prod.name} available")
            divisions.add(prod.division_id)
            lines.append({"product": prod, "qty": qty, "price": prod.price, "item": it})
            subtotal += prod.price * qty
        else:
            divisions.add("div-hotels")
            lines.append({"product": None, "qty": qty, "price": float(it.get("price", 0)), "item": it})
            subtotal += float(it.get("price", 0)) * qty

    fulfillment = body.get("fulfillment", "pickup")
    has_products = any(it.get("type") == "product" for it in items)
    shipping = DELIVERY_FEE if (fulfillment == "delivery" and has_products) else 0.0

    addr = body.get("shippingAddress", {}) or {}
    client_ref = body.get("ref")
    if client_ref:
        existing = db.query(Order).filter(
            Order.payment_reference == client_ref, Order.user_id == user.id).first()
        if existing:
            return ok(existing.to_dict(), "Order already submitted")
    order = Order(
        user_id=user.id,
        division_id=list(divisions)[0] if len(divisions) == 1 else "multiple",
        status="Processing", subtotal=subtotal, tax=0, shipping=shipping,
        total=subtotal + shipping, payment_status="awaiting_confirmation",
        payment_method="transfer", payment_reference=client_ref or make_ref(),
        fulfillment=fulfillment, receipt=receipt_url,
        shipping_address=addr, billing_address=body.get("billingAddress", addr),
        notes=body.get("notes"),
    )
    db.add(order)
    db.flush()
    for line in lines:
        it = line["item"]
        db.add(OrderItem(
            order_id=order.id, type=it.get("type", "product"),
            product_id=it.get("productId"), room_id=it.get("roomId"),
            quantity=line["qty"], price=line["price"],
            name=it.get("name"), image=it.get("image"),
        ))
    db.commit()
    db.refresh(order)
    return ok(order.to_dict(), "Receipt received — admin confirms within a minute")


@router.put("/{order_id}")
def update_order(order_id: str, body: dict, db: Session = Depends(get_db),
                 user: User = Depends(require_roles("super_admin", "division_admin"))):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if user.role == "division_admin" and order.division_id not in (user.division_id, "multiple"):
        raise HTTPException(status_code=403, detail="Not your division")
    if "status" in body:
        order.status = body["status"]
    if "paymentStatus" in body or "payment_status" in body:
        order.payment_status = body.get("paymentStatus", body.get("payment_status"))
    db.commit()
    db.refresh(order)
    return ok(order.to_dict())
