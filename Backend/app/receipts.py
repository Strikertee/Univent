"""Transfer-receipt file handling shared by the upload endpoint and the
single-request order/booking creation (receipt + record in ONE transaction)."""

import os
import uuid
from datetime import datetime

from fastapi import HTTPException, UploadFile

from app.core.config import settings

ALLOWED_TYPES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
}
MAX_BYTES = 8 * 1024 * 1024


def save_receipt_file(upload: UploadFile) -> str:
    if upload.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=422, detail="Receipt must be JPG, PNG or WebP")
    data = upload.file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=422, detail="Receipt too large (max 8MB)")
    ext = ALLOWED_TYPES[upload.content_type]
    folder = os.path.join(settings.upload_dir, "receipts", datetime.utcnow().strftime("%Y-%m"))
    os.makedirs(folder, exist_ok=True)
    name = f"{uuid.uuid4().hex}.{ext}"
    with open(os.path.join(folder, name), "wb") as f:
        f.write(data)
    return f"/{folder}/{name}".replace(os.sep, "/")
