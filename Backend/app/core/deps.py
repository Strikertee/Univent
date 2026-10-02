"""Shared request dependencies: DB session, current user, role guards."""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_token
from app.db import get_db
from app.models import User

bearer = HTTPBearer(auto_error=False)


def ok(data=None, message: str | None = None) -> dict:
    """Every response uses the {success, data, message} envelope the frontend expects."""
    return {"success": True, "data": data, "message": message}


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
) -> User:
    if not creds:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    user_id = decode_token(creds.credentials)
    user = db.get(User, user_id) if user_id else None
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    return user


def require_roles(*roles: str):
    """Route guard: `Depends(require_roles("super_admin", "division_admin"))`."""

    def guard(user: User = Depends(get_current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden: insufficient role")
        return user

    return guard


def ensure_division(user: User, division_id: str | None):
    """Division admins may only touch their own division. Raises 403 otherwise."""
    if user.role == "super_admin":
        return
    if user.role != "division_admin" or user.division_id != division_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden: not your division")
