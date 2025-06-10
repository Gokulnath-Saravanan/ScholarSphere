from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from .utils import verify_token
from ..database.supabase import supabase_client

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = verify_token(token)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except Exception:
        raise credentials_exception
        
    user = supabase_client.table('profiles').select('*').eq('id', user_id).single().execute()
    
    if not user.data:
        raise credentials_exception
        
    return user.data

async def get_current_active_user(current_user = Depends(get_current_user)):
    """Get current active user"""
    if not current_user:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user 