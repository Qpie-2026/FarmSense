from fastapi import APIRouter, HTTPException
from app.controllers.auth_controller import login_user, register_user
from app.schemas.auth_schemas import LoginRequest, RegisterRequest

router = APIRouter()

@router.post("/login")
def login(payload: LoginRequest):
    result = login_user(payload.model_dump())
    if not result["ok"]:
        raise HTTPException(status_code=401, detail=result["message"])
    return result


@router.post("/register")
def register(payload: RegisterRequest):
    result = register_user(payload.model_dump())
    if not result["ok"]:
        raise HTTPException(status_code=400, detail=result["message"])
    return result