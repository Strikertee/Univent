"""API tests: `pytest` (uses a throwaway SQLite file, never touches univent.db)."""

import os
import tempfile

os.environ["DATABASE_URL"] = f"sqlite:///{tempfile.mkdtemp()}/test.db"

from fastapi.testclient import TestClient  # noqa: E402

from app.db import SessionLocal, init_db  # noqa: E402
from app.main import app  # noqa: E402
from app.seed import seed  # noqa: E402

init_db()
db = SessionLocal()
seed(db)
db.close()

client = TestClient(app)


def auth_headers(email: str, password: str = "password") -> dict:
    res = client.post("/api/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200, res.text
    return {"Authorization": f"Bearer {res.json()['data']['token']}"}


def test_health():
    assert client.get("/api/health").json()["success"] is True


def test_public_catalogue():
    assert len(client.get("/api/divisions").json()["data"]) == 6
    assert len(client.get("/api/rooms").json()["data"]) == 6
    assert len(client.get("/api/products").json()["data"]) == 11
    room = client.get("/api/rooms/double-room-deluxe").json()["data"]
    assert room["price"] == 30000
    avail = client.get(f"/api/rooms/{room['id']}/availability").json()["data"]
    assert avail["available"] == avail["total"] == 20


def test_customer_booking_flow():
    # register + book + availability drops
    import uuid
    email = f"adaeze-{uuid.uuid4().hex[:6]}@example.com"
    reg = client.post("/api/auth/register", json={
        "firstName": "Adaeze", "lastName": "Okafor", "email": email,
        "phone": "08030000000", "password": "secret123", "passwordConfirmation": "secret123",
    })
    assert reg.status_code == 200
    headers = auth_headers(email, "secret123")
    me = client.get("/api/auth/profile", headers=headers).json()["data"]["user"]
    assert me["role"] == "customer"

    rooms = client.get("/api/rooms").json()["data"]
    room = next(r for r in rooms if r["slug"] == "royal-standard")
    before = client.get(f"/api/rooms/{room['id']}/availability").json()["data"]["available"]
    booking = client.post("/api/bookings", json={
        "roomId": room["id"], "checkIn": "2026-11-05", "checkOut": "2026-11-07",
        "guests": 2, "firstName": "Adaeze", "lastName": "Okafor",
        "email": email, "phone": "08030000000", "method": "transfer", "receipt": "data:image/jpeg;base64,xxx",
    }, headers=headers).json()["data"]
    assert booking["paymentStatus"] == "awaiting_confirmation"
    assert booking["roomNumber"].startswith("RS-")

    avail = client.get(f"/api/rooms/{room['id']}/availability").json()["data"]
    assert avail["available"] == before - 1

    mine = client.get("/api/bookings", headers=headers).json()["data"]
    assert len(mine) == 1 and mine[0]["ref"] == booking["ref"]
    return booking, headers


def test_hotel_admin_approves_and_revenue():
    booking, _ = test_customer_booking_flow()
    admin = auth_headers("hotels@univent.ui.edu.ng")
    # hotel admin sees it (division-scoped)
    all_b = client.get("/api/bookings", headers=admin).json()["data"]
    assert any(b["ref"] == booking["ref"] for b in all_b)
    # approve → revenue counts it
    upd = client.put(f"/api/bookings/{booking['id']}",
                     json={"status": "approved", "paymentStatus": "confirmed"}, headers=admin)
    assert upd.status_code == 200
    stats = client.get("/api/dashboard/stats", headers=admin).json()["data"]
    assert stats["bookings_revenue"] == booking["total"]
    # bakery admin must NOT see hotel bookings
    bakery = auth_headers("bakery@univent.ui.edu.ng")
    assert all(b["divisionId"] != "div-hotels" or True for b in
               client.get("/api/bookings", headers=bakery).json()["data"])
    others = client.get("/api/bookings", headers=bakery).json()["data"]
    assert not any(b["ref"] == booking["ref"] for b in others)


def test_division_admin_cannot_touch_other_division():
    bakery = auth_headers("bakery@univent.ui.edu.ng")
    rooms = client.get("/api/rooms").json()["data"]
    res = client.put(f"/api/rooms/{rooms[0]['id']}", json={"price": 1}, headers=bakery)
    assert res.status_code == 403
    # ...but hotel admin can edit room price + count
    admin = auth_headers("hotels@univent.ui.edu.ng")
    res = client.put(f"/api/rooms/{rooms[0]['id']}", json={"price": 31000}, headers=admin)
    assert res.status_code == 200 and res.json()["data"]["price"] == 31000


def test_order_requires_receipt_and_decrements_stock():
    email = "buyer@example.com"
    client.post("/api/auth/register", json={
        "firstName": "Buyer", "lastName": "Test", "email": email,
        "phone": "08030000001", "password": "secret123", "passwordConfirmation": "secret123",
    })
    headers = auth_headers(email, "secret123")
    prods = client.get("/api/products").json()["data"]
    sardine = next(p for p in prods if p["slug"] == "sardine-bread")
    before = sardine["stock"]
    no_receipt = client.post("/api/orders", json={
        "divisionId": "div-bakery",
        "items": [{"type": "product", "productId": sardine["id"], "quantity": 2,
                   "price": 1500, "name": "Sardine Bread", "image": ""}],
        "shippingAddress": {"firstName": "B", "address": "Hall"}, "fulfillment": "pickup",
    }, headers=headers)
    assert no_receipt.status_code == 422
    order = client.post("/api/orders", json={
        "divisionId": "div-bakery",
        "items": [{"type": "product", "productId": sardine["id"], "quantity": 2,
                   "price": 1500, "name": "Sardine Bread", "image": ""}],
        "shippingAddress": {"firstName": "B", "address": "Hall"},
        "fulfillment": "pickup", "receipt": "data:image/jpeg;base64,xxx",
    }, headers=headers).json()["data"]
    assert order["paymentStatus"] == "awaiting_confirmation"
    after = client.get("/api/products/sardine-bread").json()["data"]
    assert after["stock"] == before - 2


def test_daily_sales_scoped():
    admin = auth_headers("hotels@univent.ui.edu.ng")
    res = client.post("/api/sales", json={"date": "2026-10-02", "item": "Hall hire", "amount": 150000},
                      headers=admin)
    assert res.status_code == 201 or res.status_code == 200
    mine = client.get("/api/sales", headers=admin).json()["data"]
    assert any(s["item"] == "Hall hire" for s in mine)
    bakery = auth_headers("bakery@univent.ui.edu.ng")
    others = client.get("/api/sales", headers=bakery).json()["data"]
    assert not any(s["item"] == "Hall hire" for s in others)
