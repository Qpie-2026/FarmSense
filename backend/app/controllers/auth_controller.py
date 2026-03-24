from app.core.security import create_access_token

def login_user(user):
    email = user.get("email", "test@gmail.com")
    token = create_access_token({"sub": email})
    return {"access_token": token}
