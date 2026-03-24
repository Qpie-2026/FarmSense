from app.core.security import create_access_token
from app.core.database import db
import hashlib
import hmac
import os

users_collection = db["users"]
PASSWORD_SALT = os.getenv("PASSWORD_SALT", "purezone_local_salt")


def _hash_password(password: str) -> str:
    return hashlib.sha256(f"{PASSWORD_SALT}:{password}".encode("utf-8")).hexdigest()


def _verify_password(password: str, hashed_password: str) -> bool:
    return hmac.compare_digest(_hash_password(password), hashed_password)


def register_user(user_data: dict):
    mobile = user_data["mobile"]
    existing_user = users_collection.find_one({"mobile": mobile})
    if existing_user:
        return {"ok": False, "message": "Mobile number already registered"}

    users_collection.insert_one({
        "fullName": user_data["fullName"],
        "mobile": mobile,
        "crop": user_data["crop"],
        "location": user_data["location"],
        "password": _hash_password(user_data["password"]),
    })
    token = create_access_token({"sub": mobile, "name": user_data["fullName"]})
    return {"ok": True, "message": "Account created successfully", "access_token": token}


def login_user(credentials: dict):
    mobile = credentials["mobile"]
    password = credentials["password"]
    user = users_collection.find_one({"mobile": mobile})
    if not user:
        return {"ok": False, "message": "Invalid mobile number or password"}
    if not _verify_password(password, user["password"]):
        return {"ok": False, "message": "Invalid mobile number or password"}

    token = create_access_token({"sub": mobile, "name": user["fullName"]})
    return {"ok": True, "message": "Login successful", "access_token": token}