from fastapi import APIRouter, Body
from app.controllers.auth_controller import login_user

router = APIRouter()

@router.post("/login")
def login(payload: dict = Body(default={"email": "test@gmail.com"})):
    return login_user(payload)
