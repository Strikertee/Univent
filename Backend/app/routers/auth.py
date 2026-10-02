"""Auth: register / login / profile. Issues JWT Bearer tokens."""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, ok
from app.core.security import create_token, hash_password, verify_password
from app.db import get_db
from app.models import User

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterIn(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    phone: str = ""
    password: str
    passwordConfirmation: str = ""  # accepted for frontend compat


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class ProfileIn(BaseModel):
    firstName: str | None = None
    lastName: str | None = None
    phone: str | None = None


def _token_for(user: User) -> dict:
    return {"user": user.to_dict(), "token": create_token(user.id)}


@router.post("/register")
def register(body: RegisterIn, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=422, detail="Email already registered")
    if body.passwordConfirmation and body.password != body.passwordConfirmation:
        raise HTTPException(status_code=422, detail="Passwords do not match")
    user = User(
        first_name=body.firstName, last_name=body.lastName, email=body.email,
        phone=body.phone, password_hash=hash_password(body.password), role="customer",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return ok(_token_for(user), "Account created")


@router.post("/login")
def login(body: LoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=422, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account deactivated")
    return ok(_token_for(user), "Welcome back")


@router.post("/logout")
def logout(user: User = Depends(get_current_user)):
    # JWTs are stateless — logout is client-side token discard.
    return ok(None, "Logged out")


@router.get("/profile")
def profile(user: User = Depends(get_current_user)):
    return ok({"user": user.to_dict()})


@router.put("/profile")
def update_profile(body: ProfileIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if body.firstName:
        user.first_name = body.firstName
    if body.lastName:
        user.last_name = body.lastName
    if body.phone is not None:
        user.phone = body.phone
    db.commit()
    db.refresh(user)
    return ok({"user": user.to_dict()})


@router.post("/forgot-password")
def forgot_password(body: dict):
    # Demo-safe: never reveal whether an email exists.
    return ok(None, "If that email exists, a reset link was sent")


@router.post("/reset-password")
def reset_password(body: dict, db: Session = Depends(get_db)):
    # NOTE: production needs a real emailed token store; this accepts the demo flow.
    user = db.query(User).filter(User.email == body.get("email")).first()
    if not user or not body.get("password"):
        raise HTTPException(status_code=422, detail="Invalid reset request")
    user.password_hash = hash_password(body["password"])
    db.commit()
    return ok(None, "Password reset. Please log in.")
