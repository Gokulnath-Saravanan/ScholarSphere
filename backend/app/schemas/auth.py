from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    institution: Optional[str] = None
    department: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    sub: Optional[str] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    institution: Optional[str] = None
    department: Optional[str] = None
    position: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

class UserResponse(UserBase):
    id: str
    avatar_url: Optional[str] = None
    
    class Config:
        from_attributes = True 