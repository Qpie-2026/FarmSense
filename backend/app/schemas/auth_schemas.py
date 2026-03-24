from pydantic import BaseModel, Field


class RegisterRequest(BaseModel):
    fullName: str = Field(min_length=1)
    mobile: str = Field(min_length=10, max_length=10)
    crop: str = Field(min_length=1)
    location: str = Field(min_length=1)
    password: str = Field(min_length=6)


class LoginRequest(BaseModel):
    mobile: str = Field(min_length=10, max_length=10)
    password: str = Field(min_length=6)
