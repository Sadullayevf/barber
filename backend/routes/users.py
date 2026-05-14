from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User, Barber
from schemas import UserOut
from auth_utils import get_current_user, require_role
from pydantic import BaseModel

router = APIRouter(prefix="/users", tags=["Users"])

class RoleUpdate(BaseModel):
    role: str

@router.get("", response_model=list[UserOut])
def get_users(db: Session = Depends(get_db), current_user: User = Depends(require_role(["admin"]))):
    users = db.query(User).all()
    return users

@router.put("/{user_id}/role", response_model=UserOut)
def update_user_role(user_id: int, role_update: RoleUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_role(["admin"]))):
    if role_update.role not in ["admin", "barber", "user"]:
        raise HTTPException(status_code=400, detail="Invalid role")
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.id == current_user.id and role_update.role != "admin":
        raise HTTPException(status_code=400, detail="Cannot downgrade yourself")
        
    user.role = role_update.role
    
    # Logic to automatically create a Barber entry if role is "barber"
    if role_update.role == "barber":
        existing_barber = db.query(Barber).filter(Barber.user_id == user.id).first()
        if not existing_barber:
            new_barber = Barber(
                name=user.name,
                user_id=user.id,
                experience="1y",  # Default value
                rating=5.0,       # Default value
                specialization="General Barber", # Default value
                # image and location use defaults from the model
            )
            db.add(new_barber)
            
    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_role(["admin"]))):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
        
    if user.email == "admin@gmail.com":
        raise HTTPException(status_code=400, detail="Cannot delete default admin")
        
    db.delete(user)
    db.commit()
    return {"detail": "User deleted successfully"}
