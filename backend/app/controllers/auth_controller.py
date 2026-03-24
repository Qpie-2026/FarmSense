from app.core.security import create_access_token

def login_user(user):
    token = create_access_token({"sub": user.email})
    return {"access_token": token}