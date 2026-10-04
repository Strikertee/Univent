"""Bookings: customers create + confirm receipts; hotel admin approves."""

import random
import string
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.deps import ensure_division, get_current_user, ok, require_roles
from app.db import get_db
from app.models import Booking, Room, User
from app.receipts import save_receipt_file

router = APIRouter(prefix="/bookings", tags=["bookings"])

ROOM_PREFIX = {
    "room-double-deluxe": "DD", "room-royal-standard": "RS", "room-royal-executive": "RE",
    "room-luxury-king-bed": "LK", "room-executive-suite": "ES", "room-premium-royal-suite": "PR",
}


def make_ref(prefix: str) -> str:
    return f"{prefix}-{''.join(random.choices(string.digits, k=6))}"


def assign_room_number(db: Session, room: Room) -> str:
    prefix = ROOM_PREFIX.get(room.id, "RM")
    taken = {
        b.room_number for b in db.query(Booking).filter(
            Booking.room_id == room.id,
            Booking.status != "cancelled",
            Booking.payment_status.in_(["awaiting_confirmation", "confirmed"]),
            Booking.room_number.isnot(None),
        ).all()
    }
    n = 1
    while f"{prefix}-{n:02d}" in taken:
        n += 1
    return f"{prefix}-{n:02d}"


@router.get("")
def list_bookings(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = db.query(Booking).order_by(Booking.created_at.desc())
    if user.role == "customer":
        q = q.filter(Booking.user_id == user.id)
    elif user.role == "division_admin":
        q = q.filter(Booking.division_id == user.division_id)
    return ok([b.to_dict() for b in q.all()])


@router.get("/{booking_id}")
def get_booking(booking_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    if user.role == "customer" and b.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not your booking")
    if user.role == "division_admin" and b.division_id != user.division_id:
        raise HTTPException(status_code=403, detail="Not your division")
    return ok(b.to_dict())


@router.post("")
async def create_booking(request: Request, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Accepts EITHER multipart (fields + receipt FILE in one request — atomic)
    OR plain JSON (with a receipt URL from POST /upload/receipt)."""
    content_type = request.headers.get("content-type", "")
    if content_type.startswith("multipart/"):
        form = await request.form()
        try:
            body = {
                "roomId": form.get("roomId"),
                "checkIn": form.get("checkIn"),
                "checkOut": form.get("checkOut"),
                "guests": int(form.get("guests", 2)),
                "requests": form.get("requests"),
                "firstName": form.get("firstName"),
                "lastName": form.get("lastName"),
                "email": form.get("email"),
                "phone": form.get("phone"),
                "ref": form.get("ref"),
            }
        except (ValueError, TypeError):
            raise HTTPException(status_code=422, detail="Malformed multipart fields")
        receipt_file = form.get("receipt_file")
        receipt_url = save_receipt_file(receipt_file) if receipt_file else None
    else:
        body = await request.json()
        receipt_url = body.get("receipt")

    if not receipt_url:
        raise HTTPException(status_code=422, detail="Transfer receipt is required")

    # Row lock: concurrent bookings for the last room serialize here, so only
    # one can pass the availability check (ignored by SQLite, enforced by Postgres).
    room = (
        db.query(Room)
        .filter(Room.id == body.get("roomId"))
        .with_for_update()
        .first()
    )
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    if room.total_rooms - room.held_count(db) <= 0:
        raise HTTPException(status_code=422, detail="Room fully booked")
    try:
        check_in = date.fromisoformat(body["checkIn"])
        check_out = date.fromisoformat(body["checkOut"])
    except (KeyError, ValueError):
        raise HTTPException(status_code=422, detail="Valid checkIn/checkOut dates required")
    if check_out <= check_in:
        raise HTTPException(status_code=422, detail="checkOut must be after checkIn")
    nights = max(1, (check_out - check_in).days)
    total = room.price * nights
    client_ref = body.get("ref")
    if client_ref:
        existing = db.query(Booking).filter(Booking.ref == client_ref, Booking.user_id == user.id).first()
        if existing:
            return ok(existing.to_dict(), "Booking already submitted")
    booking = Booking(
        user_id=user.id, user_email=body.get("userEmail", user.email),
        room_id=room.id, division_id=room.division_id,
        check_in=check_in, check_out=check_out,
        guests=int(body.get("guests", 2)), adults=int(body.get("adults", 2)),
        children=int(body.get("children", 0)),
        total_nights=nights, price_per_night=room.price,
        subtotal=total, tax=0, total=total,
        method=body.get("method", "transfer"), ref=client_ref or make_ref("BK"),
        status="pending", payment_status="awaiting_confirmation",
        room_number=assign_room_number(db, room),
        receipt=receipt_url,
        special_requests=body.get("requests") or body.get("specialRequests"),
        first_name=body.get("firstName"), last_name=body.get("lastName"),
        email=body.get("email"), phone=body.get("phone"),
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return ok(booking.to_dict(), "Receipt received — admin confirms within a minute")


@router.put("/{booking_id}")
def update_booking(booking_id: str, body: dict, db: Session = Depends(get_db),
                   user: User = Depends(require_roles("super_admin", "division_admin"))):
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    ensure_division(user, b.division_id)
    if "status" in body:
        b.status = body["status"]
    if "paymentStatus" in body or "payment_status" in body:
        from datetime import datetime
        b.payment_status = body.get("paymentStatus", body.get("payment_status"))
        if b.payment_status == "confirmed":
            b.verified_at = datetime.utcnow()
    db.commit()
    db.refresh(b)
    return ok(b.to_dict())


@router.post("/{booking_id}/cancel")
def cancel_booking(booking_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    if user.role == "customer" and b.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not your booking")
    b.status = "cancelled"
    db.commit()
    return ok(b.to_dict(), "Booking cancelled")
