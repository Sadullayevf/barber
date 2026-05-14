from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class BarberCreate(BaseModel):
    name: str
    experience: str
    specialization: str
    rating: float = 5.0

class BarberUpdate(BaseModel):
    name: Optional[str] = None
    experience: Optional[str] = None
    specialization: Optional[str] = None
    rating: Optional[float] = None
    avatar: Optional[str] = None
    location: Optional[str] = None
    working_hours: Optional[str] = None
    price: Optional[float] = None
    availability: Optional[str] = None

class BarberOut(BaseModel):
    id: int
    name: str
    experience: str
    rating: float
    specialization: str
    image: str
    avatar: Optional[str]
    location: str
    working_hours: str
    price: float
    availability: Optional[str]
    
    class Config:
        from_attributes = True


class ServiceOut(BaseModel):
    id: int
    name: str
    duration: int
    price: float

    class Config:
        from_attributes = True


class BookingCreate(BaseModel):
    customer_name: str = Field(min_length=2, max_length=60)
    phone: str = Field(min_length=6, max_length=20)
    barber_id: int
    service_id: int
    date: str
    time: str


class BookingOut(BaseModel):
    id: int
    customer_name: str
    phone: str
    barber_id: int
    barber_name: str
    service_id: int
    service_name: str
    date: str
    time: str
    status: str
    cancel_reason: Optional[str] = None


class SlotResponse(BaseModel):
    time: str
    available: bool


class PortfolioCreate(BaseModel):
    image: str
    description: Optional[str] = None


class PortfolioOut(BaseModel):
    id: int
    barber_id: int
    image: str
    description: Optional[str]

    class Config:
        from_attributes = True


class BookingStatusUpdate(BaseModel):
    status: str
    cancel_reason: Optional[str] = None
