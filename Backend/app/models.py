"""SQLAlchemy models. IDs are UUID strings — the seed uses the SAME ids as the
frontend mock data (div-hotels, prod-sardine, ...) so swapping frontend reads
to this API later is seamless."""

import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import JSON

from app.db import Base

JSONType = JSON().with_variant(JSONB(), "postgresql")


def new_id() -> str:
    return str(uuid.uuid4())


def utcnow() -> datetime:
    return datetime.utcnow()


class Division(Base):
    __tablename__ = "divisions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    name: Mapped[str] = mapped_column(String(255))
    slug: Mapped[str] = mapped_column(String(255), unique=True)
    description: Mapped[str | None] = mapped_column(Text(), nullable=True)
    short_description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    logo: Mapped[str | None] = mapped_column(String(500), nullable=True)
    banner_image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    icon: Mapped[str | None] = mapped_column(String(50), nullable=True)
    color: Mapped[str | None] = mapped_column(String(100), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    admin_id: Mapped[str | None] = mapped_column(String(36), nullable=True)

    def to_dict(self) -> dict:
        return {
            "id": self.id, "name": self.name, "slug": self.slug,
            "description": self.description, "shortDescription": self.short_description,
            "logo": self.logo, "bannerImage": self.banner_image, "icon": self.icon,
            "color": self.color, "isActive": self.is_active, "sortOrder": self.sort_order,
        }


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(30), default="customer")
    division_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("divisions.id"), nullable=True)
    avatar: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)

    def to_dict(self) -> dict:
        return {
            "id": self.id, "firstName": self.first_name, "lastName": self.last_name,
            "email": self.email, "phone": self.phone, "role": self.role,
            "divisionId": self.division_id, "avatar": self.avatar, "isActive": self.is_active,
            "createdAt": self.created_at.isoformat(), "updatedAt": self.updated_at.isoformat(),
        }

    def manages(self, division_id: str | None) -> bool:
        if self.role == "super_admin":
            return True
        return self.role == "division_admin" and self.division_id == division_id


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    name: Mapped[str] = mapped_column(String(255))
    slug: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text(), nullable=True)
    image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    division_id: Mapped[str] = mapped_column(String(36), ForeignKey("divisions.id"))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    def to_dict(self) -> dict:
        return {
            "id": self.id, "name": self.name, "slug": self.slug,
            "description": self.description, "image": self.image,
            "divisionId": self.division_id, "isActive": self.is_active,
            "sortOrder": self.sort_order,
        }


class Product(Base):
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    name: Mapped[str] = mapped_column(String(255))
    slug: Mapped[str] = mapped_column(String(255), unique=True)
    description: Mapped[str | None] = mapped_column(Text(), nullable=True)
    short_description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    price: Mapped[float] = mapped_column(Float)
    original_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    images: Mapped[list] = mapped_column(JSONType, default=list)
    category_id: Mapped[str] = mapped_column(String(36), ForeignKey("categories.id"))
    division_id: Mapped[str] = mapped_column(String(36), ForeignKey("divisions.id"))
    sku: Mapped[str | None] = mapped_column(String(100), unique=True, nullable=True)
    stock: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    tags: Mapped[list] = mapped_column(JSONType, default=list)
    specifications: Mapped[dict] = mapped_column(JSONType, default=dict)

    def to_dict(self) -> dict:
        return {
            "id": self.id, "name": self.name, "slug": self.slug,
            "description": self.description, "shortDescription": self.short_description,
            "price": self.price, "originalPrice": self.original_price, "images": self.images or [],
            "categoryId": self.category_id, "divisionId": self.division_id, "sku": self.sku,
            "stock": self.stock, "isActive": self.is_active, "isFeatured": self.is_featured,
            "tags": self.tags or [], "specifications": self.specifications or {},
        }


class Room(Base):
    __tablename__ = "rooms"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    name: Mapped[str] = mapped_column(String(255))
    slug: Mapped[str] = mapped_column(String(255), unique=True)
    description: Mapped[str | None] = mapped_column(Text(), nullable=True)
    short_description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    price: Mapped[float] = mapped_column(Float)
    original_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    images: Mapped[list] = mapped_column(JSONType, default=list)
    category_id: Mapped[str] = mapped_column(String(36), ForeignKey("categories.id"))
    division_id: Mapped[str] = mapped_column(String(36), ForeignKey("divisions.id"))
    capacity: Mapped[int] = mapped_column(Integer, default=2)
    bed_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    bed_size: Mapped[str | None] = mapped_column(String(50), nullable=True)
    amenities: Mapped[list] = mapped_column(JSONType, default=list)
    features: Mapped[list] = mapped_column(JSONType, default=list)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    total_rooms: Mapped[int] = mapped_column(Integer, default=1)
    available_rooms: Mapped[int] = mapped_column(Integer, default=1)

    bookings: Mapped[list["Booking"]] = relationship(back_populates="room")

    def held_count(self, session) -> int:
        """Bookings currently occupying a room of this type."""
        return (
            session.query(Booking)
            .filter(
                Booking.room_id == self.id,
                Booking.status != "cancelled",
                Booking.payment_status.in_(["awaiting_confirmation", "confirmed"]),
            )
            .count()
        )

    def to_dict(self, session=None) -> dict:
        held = self.held_count(session) if session is not None else 0
        return {
            "id": self.id, "name": self.name, "slug": self.slug,
            "description": self.description, "shortDescription": self.short_description,
            "price": self.price, "originalPrice": self.original_price, "images": self.images or [],
            "categoryId": self.category_id, "divisionId": self.division_id,
            "capacity": self.capacity, "bedType": self.bed_type, "bedSize": self.bed_size,
            "amenities": self.amenities or [], "features": self.features or [],
            "isActive": self.is_active, "isFeatured": self.is_featured,
            "totalRooms": self.total_rooms,
            "availableRooms": max(0, self.total_rooms - held),
        }


class Facility(Base):
    __tablename__ = "facilities"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    name: Mapped[str] = mapped_column(String(255))
    slug: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text(), nullable=True)
    short_description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    images: Mapped[list] = mapped_column(JSONType, default=list)
    division_id: Mapped[str] = mapped_column(String(36), ForeignKey("divisions.id"))
    icon: Mapped[str | None] = mapped_column(String(50), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    requires_booking: Mapped[bool] = mapped_column(Boolean, default=False)

    def to_dict(self) -> dict:
        return {
            "id": self.id, "name": self.name, "slug": self.slug,
            "description": self.description, "shortDescription": self.short_description,
            "images": self.images or [], "divisionId": self.division_id, "icon": self.icon,
            "isActive": self.is_active, "requiresBooking": self.requires_booking,
        }


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    user_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    room_id: Mapped[str] = mapped_column(String(36), ForeignKey("rooms.id"))
    division_id: Mapped[str] = mapped_column(String(36), ForeignKey("divisions.id"))
    check_in: Mapped[date] = mapped_column(Date)
    check_out: Mapped[date] = mapped_column(Date)
    guests: Mapped[int] = mapped_column(Integer, default=2)
    adults: Mapped[int] = mapped_column(Integer, default=2)
    children: Mapped[int] = mapped_column(Integer, default=0)
    total_nights: Mapped[int] = mapped_column(Integer, default=1)
    price_per_night: Mapped[float] = mapped_column(Float)
    subtotal: Mapped[float] = mapped_column(Float)
    tax: Mapped[float] = mapped_column(Float, default=0)
    total: Mapped[float] = mapped_column(Float)
    method: Mapped[str] = mapped_column(String(50), default="transfer")
    ref: Mapped[str] = mapped_column(String(20), unique=True)
    status: Mapped[str] = mapped_column(String(30), default="pending")
    payment_status: Mapped[str] = mapped_column(String(30), default="awaiting_confirmation")
    room_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    receipt: Mapped[str | None] = mapped_column(Text(), nullable=True)
    verified_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    special_requests: Mapped[str | None] = mapped_column(Text(), nullable=True)
    first_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    last_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    room: Mapped["Room"] = relationship(back_populates="bookings")

    def to_dict(self) -> dict:
        return {
            "id": self.id, "ref": self.ref, "userId": self.user_id,
            "roomId": self.room_id, "roomSlug": self.room.slug if self.room else None,
            "roomName": self.room.name if self.room else None,
            "divisionId": self.division_id,
            "checkIn": self.check_in.isoformat(), "checkOut": self.check_out.isoformat(),
            "guests": self.guests, "adults": self.adults, "children": self.children,
            "nights": self.total_nights, "totalNights": self.total_nights,
            "pricePerNight": self.price_per_night, "subtotal": self.subtotal,
            "tax": self.tax, "total": self.total, "method": self.method,
            "status": self.status, "paymentStatus": self.payment_status,
            "roomNumber": self.room_number, "receipt": bool(self.receipt),
            "verifiedAt": self.verified_at.isoformat() if self.verified_at else None,
            "specialRequests": self.special_requests, "requests": self.special_requests,
            "firstName": self.first_name, "lastName": self.last_name,
            "email": self.email, "phone": self.phone,
            "date": self.created_at.date().isoformat(),
        }


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    user_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    division_id: Mapped[str] = mapped_column(String(100), default="multiple")
    status: Mapped[str] = mapped_column(String(30), default="Processing")
    subtotal: Mapped[float] = mapped_column(Float, default=0)
    tax: Mapped[float] = mapped_column(Float, default=0)
    shipping: Mapped[float] = mapped_column(Float, default=0)
    discount: Mapped[float] = mapped_column(Float, default=0)
    total: Mapped[float] = mapped_column(Float, default=0)
    currency: Mapped[str] = mapped_column(String(10), default="NGN")
    payment_status: Mapped[str] = mapped_column(String(30), default="awaiting_confirmation")
    payment_method: Mapped[str] = mapped_column(String(50), default="transfer")
    payment_reference: Mapped[str | None] = mapped_column(String(50), nullable=True)
    fulfillment: Mapped[str] = mapped_column(String(20), default="pickup")
    receipt: Mapped[str | None] = mapped_column(Text(), nullable=True)
    shipping_address: Mapped[dict] = mapped_column(JSONType, default=dict)
    billing_address: Mapped[dict] = mapped_column(JSONType, default=dict)
    notes: Mapped[str | None] = mapped_column(Text(), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    items: Mapped[list["OrderItem"]] = relationship(back_populates="order", cascade="all, delete-orphan")

    def to_dict(self) -> dict:
        addr = self.shipping_address or {}
        return {
            "id": self.id, "ref": self.payment_reference, "userId": self.user_id,
            "divisionId": self.division_id, "status": self.status,
            "subtotal": self.subtotal, "tax": self.tax, "shipping": self.shipping,
            "discount": self.discount, "total": self.total,
            "method": self.payment_method, "paymentMethod": self.payment_method,
            "paymentStatus": self.payment_status, "fulfillment": self.fulfillment,
            "receipt": bool(self.receipt),
            "items": [i.to_dict() for i in self.items],
            "firstName": addr.get("firstName", ""), "lastName": addr.get("lastName", ""),
            "email": addr.get("email", ""), "phone": addr.get("phone", ""),
            "address": addr.get("address", ""), "city": addr.get("city", ""),
            "date": self.created_at.date().isoformat(),
        }


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    order_id: Mapped[str] = mapped_column(String(36), ForeignKey("orders.id"))
    type: Mapped[str] = mapped_column(String(20))
    product_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    room_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    facility_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    price: Mapped[float] = mapped_column(Float, default=0)
    name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    image: Mapped[str | None] = mapped_column(String(500), nullable=True)

    order: Mapped["Order"] = relationship(back_populates="items")

    def to_dict(self) -> dict:
        return {
            "id": self.id, "type": self.type, "productId": self.product_id,
            "roomId": self.room_id, "quantity": self.quantity, "price": self.price,
            "name": self.name, "image": self.image,
        }


class DailySale(Base):
    __tablename__ = "daily_sales"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    division_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("divisions.id"), nullable=True)
    division_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    date: Mapped[date] = mapped_column(Date)
    item: Mapped[str] = mapped_column(Text())
    amount: Mapped[float] = mapped_column(Float)
    entered_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    def to_dict(self) -> dict:
        return {
            "id": self.id, "divisionId": self.division_id, "divisionName": self.division_name,
            "date": self.date.isoformat(), "item": self.item, "amount": self.amount,
            "enteredBy": self.entered_by,
        }
