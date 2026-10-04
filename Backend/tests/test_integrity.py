"""Integrity tests: single-request multipart creates, atomic stock guard, no overbooking."""

import os
import tempfile
import uuid

os.environ["DATABASE_URL"] = "sqlite:///" + tempfile.mkdtemp() + "/integrity.db"

from fastapi.testclient import TestClient  # noqa: E402

from app.db import SessionLocal, init_db  # noqa: E402
from app.main import app  # noqa: E402
from app.seed import seed  # noqa: E402

init_db()
_db = SessionLocal()
seed(_db)
_db.close()

client = TestClient(app)


def make_user() -> dict:
    email = f"user-{uuid.uuid4().hex[:6]}@example.com"
    client.post("/api/auth/register", json={
        "firstName": "Test", "lastName": "User", "email": email,
        "phone": "08030000000", "password": "secret123", "passwordConfirmation": "secret123",
    })
    token = client.post("/api/auth/login", json={"email": email, "password": "secret123"}).json()["data"]["token"]
    return {"Authorization": f"Bearer {token}"}


def test_multipart_order_single_request():
    """Receipt file + order fields in ONE request — no separate upload call."""
    headers = make_user()
    prods = client.get("/api/products").json()["data"]
    sardine = next(p for p in prods if p["slug"] == "sardine-bread")
    res = client.post(
        "/api/orders",
        headers=headers,
        data={
            "ref": "UI-700001",
            "divisionId": "div-bakery",
            "fulfillment": "pickup",
            "shippingAddress": '{"firstName":"T","address":"Hall"}',
            "items": '[{"type":"product","productId":"%s","quantity":1,"price":1500,"name":"Sardine Bread","image":""}]' % sardine["id"],
        },
        files={"receipt_file": ("receipt.jpg", b"\xff\xd8\xff fake-jpeg-bytes", "image/jpeg")},
    )
    assert res.status_code == 200, res.text
    data = res.json()["data"]
    assert data["ref"] == "UI-700001"
    assert data["receipt"].startswith("/uploads/receipts/")


def test_multipart_booking_single_request():
    headers = make_user()
    rooms = client.get("/api/rooms").json()["data"]
    room = next(r for r in rooms if r["slug"] == "double-room-deluxe")
    res = client.post(
        "/api/bookings",
        headers=headers,
        data={
            "ref": "BK-700001",
            "roomId": room["id"],
            "checkIn": "2026-12-10",
            "checkOut": "2026-12-12",
            "guests": "2",
            "firstName": "T",
            "email": "t@example.com",
        },
        files={"receipt_file": ("receipt.png", b"\x89PNG fake-bytes", "image/png")},
    )
    assert res.status_code == 200, res.text
    assert res.json()["data"]["roomNumber"].startswith("DD-")


def test_stock_cannot_oversell():
    """Last unit: first buyer wins, second gets 422 — stock never goes negative."""
    headers = make_user()

    def buy(qty: int, ref: str):
        prods = client.get("/api/products").json()["data"]
        sardine = next(p for p in prods if p["slug"] == "sardine-bread")
        return client.post("/api/orders", json={
            "ref": ref, "divisionId": "div-bakery", "fulfillment": "pickup",
            "receipt": "http://x/r.jpg",
            "shippingAddress": {"firstName": "T", "address": "Hall"},
            "items": [{"type": "product", "productId": sardine["id"], "quantity": qty,
                       "price": 1500, "name": "Sardine Bread", "image": ""}],
        }, headers=headers), sardine["stock"]

    stock = client.get("/api/products/sardine-bread").json()["data"]["stock"]
    if stock > 1:
        bulk, _ = buy(stock - 1, "UI-700002")
        assert bulk.status_code == 200
    first, _ = buy(1, "UI-700003")
    assert first.status_code == 200
    second, _ = buy(1, "UI-700004")
    assert second.status_code == 422
    assert "Only 0" in second.json()["detail"]
    assert client.get("/api/products/sardine-bread").json()["data"]["stock"] == 0


def test_room_cannot_overbook():
    """Booking past the last free room is rejected; availability floors at 0."""
    headers = make_user()
    rooms = client.get("/api/rooms").json()["data"]
    tiny = min(rooms, key=lambda r: r["totalRooms"])
    before = client.get(f"/api/rooms/{tiny['id']}/availability").json()["data"]["available"]
    made = 0
    for i in range(before + 2):
        res = client.post("/api/bookings", json={
            "ref": "BK-71%04d" % i, "roomId": tiny["id"],
            "checkIn": "2026-12-01", "checkOut": "2026-12-02", "guests": 1,
            "firstName": "T", "email": "t@example.com", "receipt": "http://x/r.jpg",
        }, headers=headers)
        if res.status_code == 200:
            made += 1
        else:
            assert res.status_code == 422
            break
    avail = client.get(f"/api/rooms/{tiny['id']}/availability").json()["data"]
    assert avail["available"] == 0
    assert made == before
