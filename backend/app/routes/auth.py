from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from typing import Any
from ..auth.utils import (
    verify_password,
    get_password_hash,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from ..auth.deps import get_current_active_user
from ..schemas.auth import UserCreate, UserLogin, Token, UserUpdate, UserResponse
from ..database.supabase import supabase_client
import uuid

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate) -> Any:
    """Register a new user"""
    try:
        # Check if user already exists
        existing_user = supabase_client.table('profiles').select('*').eq('email', user_data.email).execute()
        if existing_user.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
            
        # Create user
        user_id = str(uuid.uuid4())
        new_user = {
            'id': user_id,
            'email': user_data.email,
            'full_name': user_data.full_name,
            'institution': user_data.institution,
            'department': user_data.department,
            'password_hash': get_password_hash(user_data.password)
        }
        
        response = supabase_client.table('profiles').insert(new_user).execute()
        return response.data[0]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()) -> Any:
    """Login user and return JWT token"""
    try:
        # Get user
        user = supabase_client.table('profiles').select('*').eq('email', form_data.username).single().execute()
        
        if not user.data or not verify_password(form_data.password, user.data['password_hash']):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.data['id']},
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user = Depends(get_current_active_user)) -> Any:
    """Get current user profile"""
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_user_me(
    user_update: UserUpdate,
    current_user = Depends(get_current_active_user)
) -> Any:
    """Update current user profile"""
    try:
        update_data = user_update.dict(exclude_unset=True)
        
        response = supabase_client.table('profiles').update(update_data).eq('id', current_user['id']).execute()
        
        return response.data[0]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/reset-password")
async def reset_password(email: str) -> Any:
    """Request password reset"""
    try:
        user = supabase_client.table('profiles').select('*').eq('email', email).single().execute()
        
        if not user.data:
            # Return success even if email doesn't exist (security best practice)
            return {"message": "If your email is registered, you will receive a password reset link"}
            
        # TODO: Implement actual password reset email sending
        # For now, just return success message
        return {"message": "If your email is registered, you will receive a password reset link"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        ) 