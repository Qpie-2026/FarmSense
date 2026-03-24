from fastapi import APIRouter
from app.controllers.auth_controller import login_user

router = APIRouter()

@router.post("/login")
def login():
    return login_user({"email": "test@gmail.com"})