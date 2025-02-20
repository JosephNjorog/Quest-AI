from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from eth_account.messages import encode_defunct
from web3 import Web3
from app.core.security import create_access_token
from app.core.config import settings
from app.db.base import get_db
from app.models.user import User
from app.schemas.user import UserCreate
import secrets

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
w3 = Web3(Web3.HTTPProvider(settings.WEB3_PROVIDER_URI))

@router.post("/nonce/{wallet_address}")
async def get_nonce(wallet_address: str, db: Session = Depends(get_db)):
    """Get a nonce for wallet signature."""
    wallet_address = wallet_address.lower()
    user = db.query(User).filter(User.wallet_address == wallet_address).first()
    
    if not user:
        # Create new user with nonce
        nonce = secrets.token_hex(32)
        new_user = User(wallet_address=wallet_address, nonce=nonce)
        db.add(new_user)
        db.commit()
        return {"nonce": nonce}
    
    # Update existing user's nonce
    new_nonce = secrets.token_hex(32)
    user.nonce = new_nonce
    db.commit()
    return {"nonce": new_nonce}

@router.post("/verify-signature")
async def verify_signature(
    wallet_address: str,
    signature: str,
    db: Session = Depends(get_db)
):
    """Verify wallet signature and return JWT token."""
    user = db.query(User).filter(User.wallet_address == wallet_address.lower()).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    message = f"Sign this message to verify your wallet: {user.nonce}"
    message_hash = encode_defunct(text=message)
    
    try:
        recovered_address = w3.eth.account.recover_message(
            message_hash, signature=signature
        )
        if recovered_address.lower() != wallet_address.lower():
            raise HTTPException(status_code=400, detail="Invalid signature")
        
        # Create new access token
        access_token = create_access_token(subject=user.id)
        
        # Update nonce
        user.nonce = secrets.token_hex(32)
        db.commit()
        
        return {
            "access_token": access_token,
            "token_type": "bearer"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail="Signature verification failed")