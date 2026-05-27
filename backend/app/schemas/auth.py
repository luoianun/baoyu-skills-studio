from pydantic import BaseModel, EmailStr

class RegisterIn(BaseModel):
    email: EmailStr
    username: str
    password: str

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class TokenOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class MeOut(BaseModel):
    id: int
    email: str
    username: str
    role: str
    credits: int
    model_config = {"from_attributes": True}

class RefreshIn(BaseModel):
    refresh_token: str
