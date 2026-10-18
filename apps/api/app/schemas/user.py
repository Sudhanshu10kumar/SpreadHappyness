from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=30)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    full_name: str = Field(..., min_length=2, max_length=100)

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        clean = v.strip().lower()
        if not clean.replace("_", "").isalnum():
            raise ValueError("Username may only contain letters, numbers, and underscores")
        return clean

class UserLogin(BaseModel):
    login: str  # Can be username or email
    password: str

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    bio: Optional[str] = Field(None, max_length=1000)
    avatar_url: Optional[str] = Field(None, max_length=500)
    website: Optional[str] = Field(None, max_length=255)
    pen_name: Optional[str] = Field(None, max_length=100)
    theme_preference: Optional[str] = Field(None, max_length=50)
    is_private_account: Optional[bool] = None
    allow_comments: Optional[bool] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=128)

class UserSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    username: str
    full_name: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    role: str
    is_verified: bool
    created_at: datetime

class UserProfileResponse(UserSummary):
    email: Optional[str] = None
    website: Optional[str] = None
    pen_name: Optional[str] = None
    theme_preference: Optional[str] = "midnight"
    posts_count: int = 0
    followers_count: int = 0
    following_count: int = 0
    is_following: Optional[bool] = False

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserSummary
