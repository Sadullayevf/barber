from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import and_
from sqlalchemy.orm import Session
import json

from database import get_db
from models import Barber, Booking, Service, User
from schemas import BookingCreate, BookingOut, SlotResponse, BookingStatusUpdate
from auth_utils import get_current_user

router = APIRouter(tags=["Bookings"])
TIME_SLOTS = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
    "18:00", "18:30", "19:00"
]


@router.get("/slots/{barber_id}/{date}", response_model=list[SlotResponse])
def get_slots(barber_id: int, date: str, db: Session = Depends(get_db)):
    barber = db.query(Barber).filter(Barber.id == barber_id).first()
    if not barber:
        raise HTTPException(status_code=404, detail="Barber not found")

    booked = db.query(Booking).filter(
        and_(
            Booking.barber_id == barber_id,
            Booking.date == date,
            Booking.status != "cancelled",
        )
    ).all()
    booked_times = {item.time for item in booked}

    # Check barber's manual availability
    if barber.availability:
        try:
            disabled_slots = json.loads(barber.availability)
            booked_times.update(disabled_slots)
        except:
            pass

    return [SlotResponse(time=slot, available=slot not in booked_times) for slot in TIME_SLOTS]


@router.post("/booking", response_model=BookingOut)
def create_booking(payload: BookingCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "user":
        raise HTTPException(status_code=403, detail="Only regular users can book appointments")
    
    if payload.time not in TIME_SLOTS:
        raise HTTPException(status_code=400, detail="Invalid time slot")

    barber = db.query(Barber).filter(Barber.id == payload.barber_id).first()
    if not barber:
        raise HTTPException(status_code=404, detail="Barber not found")

    service = db.query(Service).filter(Service.id == payload.service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    existing = db.query(Booking).filter(
        and_(
            Booking.barber_id == payload.barber_id,
            Booking.date == payload.date,
            Booking.time == payload.time,
            Booking.status != "cancelled",
        )
    ).first()

    if existing:
        raise HTTPException(status_code=409, detail="Selected slot is no longer available")

    booking = Booking(
        customer_name=payload.customer_name.strip(),
        phone=payload.phone.strip(),
        barber_id=payload.barber_id,
        service_id=payload.service_id,
        date=payload.date,
        time=payload.time,
        status="pending",
        user_id=current_user.id
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    return BookingOut(
        id=booking.id,
        customer_name=booking.customer_name,
        phone=booking.phone,
        barber_id=booking.barber_id,
        barber_name=barber.name,
        service_id=booking.service_id,
        service_name=service.name,
        date=booking.date,
        time=booking.time,
        status=booking.status,
    )


@router.get("/bookings", response_model=list[BookingOut])
def get_bookings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Booking)
    if current_user.role == "user":
        query = query.filter(Booking.user_id == current_user.id)
    elif current_user.role == "barber":
        # Find barber profile linked to this user
        barber = db.query(Barber).filter(Barber.user_id == current_user.id).first()
        if barber:
            query = query.filter(Booking.barber_id == barber.id)
        else:
            query = query.filter(Booking.id == -1)
            
    bookings = query.order_by(Booking.date, Booking.time).all()
    results: list[BookingOut] = []
    for booking in bookings:
        results.append(
            BookingOut(
                id=booking.id,
                customer_name=booking.customer_name,
                phone=booking.phone,
                barber_id=booking.barber_id,
                barber_name=booking.barber.name,
                service_id=booking.service_id,
                service_name=booking.service.name,
                date=booking.date,
                time=booking.time,
                status=booking.status,
                cancel_reason=booking.cancel_reason,
            )
        )
    return results


@router.post("/booking/{booking_id}/confirm", response_model=BookingOut)
def confirm_booking(booking_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "barber":
        raise HTTPException(status_code=403, detail="Only barbers can confirm bookings")
    
    barber = db.query(Barber).filter(Barber.user_id == current_user.id).first()
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking.barber_id != barber.id:
        raise HTTPException(status_code=403, detail="Not authorized to confirm this booking")
    
    booking.status = "confirmed"
    db.commit()
    db.refresh(booking)
    
    return BookingOut(
        id=booking.id,
        customer_name=booking.customer_name,
        phone=booking.phone,
        barber_id=booking.barber_id,
        barber_name=booking.barber.name,
        service_id=booking.service_id,
        service_name=booking.service.name,
        date=booking.date,
        time=booking.time,
        status=booking.status,
        cancel_reason=booking.cancel_reason,
    )


@router.post("/booking/{booking_id}/cancel")
def cancel_booking_v2(booking_id: int, payload: BookingStatusUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if current_user.role == "user" and booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this booking")
    
    if current_user.role == "barber":
        barber = db.query(Barber).filter(Barber.user_id == current_user.id).first()
        if booking.barber_id != barber.id:
            raise HTTPException(status_code=403, detail="Not authorized to cancel this booking")

    booking.status = "cancelled"
    booking.cancel_reason = payload.cancel_reason
    db.commit()
    return {"message": "Booking cancelled successfully"}


@router.delete("/booking/{booking_id}")
def cancel_booking(booking_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if current_user.role == "user" and booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this booking")
        
    booking.status = "cancelled"
    db.commit()
    return {"message": "Booking cancelled successfully"}
