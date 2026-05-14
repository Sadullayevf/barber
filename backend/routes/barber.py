from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json

from database import get_db
from models import Barber, Portfolio, User
from schemas import BarberOut, BarberUpdate, PortfolioCreate, PortfolioOut
from auth_utils import get_current_user, require_role

router = APIRouter(prefix="/barbers", tags=["Barbers"])


@router.get("", response_model=list[BarberOut])
def get_barbers(db: Session = Depends(get_db), current_user: User = Depends(require_role(["user"]))):
    return db.query(Barber).order_by(Barber.id).all()


@router.get("/me", response_model=BarberOut)
def get_my_barber_profile(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "barber":
        raise HTTPException(status_code=403, detail="Only barbers have profiles")
    barber = db.query(Barber).filter(Barber.user_id == current_user.id).first()
    if not barber:
        raise HTTPException(status_code=404, detail="Barber profile not found")
    return barber


@router.put("/me", response_model=BarberOut)
def update_my_barber_profile(payload: BarberUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "barber":
        raise HTTPException(status_code=403, detail="Only barbers can update their profiles")
    barber = db.query(Barber).filter(Barber.user_id == current_user.id).first()
    if not barber:
        raise HTTPException(status_code=404, detail="Barber profile not found")
    
    update_data = payload.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(barber, key, value)
    
    db.commit()
    db.refresh(barber)
    return barber


@router.get("/{barber_id}/portfolio", response_model=list[PortfolioOut])
def get_barber_portfolio(barber_id: int, db: Session = Depends(get_db)):
    return db.query(Portfolio).filter(Portfolio.barber_id == barber_id).all()


@router.post("/me/portfolio", response_model=PortfolioOut)
def add_portfolio_item(payload: PortfolioCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "barber":
        raise HTTPException(status_code=403, detail="Only barbers can add to portfolio")
    barber = db.query(Barber).filter(Barber.user_id == current_user.id).first()
    if not barber:
        raise HTTPException(status_code=404, detail="Barber profile not found")
    
    item = Portfolio(
        barber_id=barber.id,
        image=payload.image,
        description=payload.description
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/me/portfolio/{item_id}")
def delete_portfolio_item(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "barber":
        raise HTTPException(status_code=403, detail="Only barbers can delete from portfolio")
    barber = db.query(Barber).filter(Barber.user_id == current_user.id).first()
    
    item = db.query(Portfolio).filter(Portfolio.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    
    if item.barber_id != barber.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this item")
    
    db.delete(item)
    db.commit()
    return {"message": "Portfolio item deleted"}
