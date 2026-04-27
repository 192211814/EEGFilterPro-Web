"""
Authentication endpoints for user signup, login, and token verification.
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr, validator
from typing import Optional
import re

try:
    from .auth import hash_password, verify_password, create_access_token, get_current_user
    from .database import create_user, get_user_by_email, get_user_by_id
except ImportError:
    from auth import hash_password, verify_password, create_access_token, get_current_user
    from database import create_user, get_user_by_email, get_user_by_id

# Using /auth prefix for authentication endpoints
router = APIRouter(prefix="/auth", tags=["Authentication"])


# Request/Response Models
class SignupRequest(BaseModel):
    name: str # Changed from username to name as per requirement
    email: EmailStr
    password: str
    
    @validator('name')
    def validate_name(cls, v):
        if len(v) < 2:
            raise ValueError('Name must be at least 2 characters')
        return v
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        if len(v) > 72:
            raise ValueError('Password cannot be longer than 72 characters')
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    @validator('password')
    def validate_password(cls, v):
        if len(v) > 72:
            raise ValueError('Password cannot be longer than 72 characters')
        return v


class AuthResponse(BaseModel):
    status: str
    message: str
    token: Optional[str] = None
    user: Optional[dict] = None


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    created_at: str


@router.post("/register", response_model=AuthResponse)
async def register(request: SignupRequest):
    """
    Register a new user account.
    POST /register
    """
    # Check if user already exists
    existing_user = get_user_by_email(request.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash the password
    password_hash = hash_password(request.password)
    
    # Create the user
    try:
        user_id = create_user(request.name, request.email, password_hash)
    except Exception as e:
        # Surface the actual DB error so we can diagnose it
        raise HTTPException(status_code=500, detail=f"DB Error: {str(e)}")
    
    if user_id is None:
        raise HTTPException(status_code=400, detail="Registration failed: user_id was None")
    
    # Create access token so user can log in immediately
    token_data = {
        "user_id": user_id,
        "email": request.email,
        "name": request.name
    }
    access_token = create_access_token(token_data)
    
    user_data = {
        "id": user_id,
        "name": request.name,
        "email": request.email
    }
    
    return AuthResponse(
        status="success",
        message="Registration successful",
        token=access_token,
        user=user_data
    )


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    """
    Authenticate a user.
    POST /auth/login
    """
    # Get user by email
    user = get_user_by_email(request.email)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not verify_password(request.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create access token
    token_data = {
        "user_id": user['id'],
        "email": user['email'],
        "name": user['name']
    }
    access_token = create_access_token(token_data)
    
    # Remove password hash from response
    user_data = {
        "id": user['id'],
        "name": user['name'],
        "email": user['email'],
        "created_at": user['created_at']
    }
    
    return AuthResponse(
        status="success",
        message="Login successful",
        token=access_token,
        user=user_data
    )


@router.get("/verify", response_model=UserResponse)
async def verify_token(current_user: dict = Depends(get_current_user)):
    """
    Verify the JWT token and return user information.
    GET /auth/verify
    """
    # Get full user data from database
    user = get_user_by_id(current_user['user_id'])
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse(
        id=user['id'],
        name=user['name'],
        email=user['email'],
        created_at=user['created_at']
    )


@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """
    Get current authenticated user's information.
    GET /auth/me
    """
    user = get_user_by_id(current_user['user_id'])
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": user['id'],
        "name": user['name'],
        "email": user['email'],
        "created_at": user['created_at']
    }

