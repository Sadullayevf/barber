from sqlalchemy import Column, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False, default="user")


class Barber(Base):
    __tablename__ = "barbers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    experience = Column(String, nullable=False)
    rating = Column(Float, nullable=False)
    specialization = Column(String, nullable=False)
    image = Column(String, nullable=False, default="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=400&fit=crop")
    avatar = Column(String, nullable=True)  # New field for profile image
    location = Column(String, nullable=False, default="Main Street 123")
    working_hours = Column(String, nullable=False, default="09:00-18:00")
    price = Column(Float, nullable=False, default=25.0)
    availability = Column(String, nullable=True)  # JSON list of disabled slots
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    bookings = relationship("Booking", back_populates="barber")
    user = relationship("User")
    portfolio = relationship("Portfolio", back_populates="barber")


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    duration = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)

    bookings = relationship("Booking", back_populates="service")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    barber_id = Column(Integer, ForeignKey("barbers.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    date = Column(String, nullable=False)
    time = Column(String, nullable=False)
    status = Column(String, nullable=False, default="pending")
    cancel_reason = Column(String, nullable=True)

    barber = relationship("Barber", back_populates="bookings")
    service = relationship("Service", back_populates="bookings")
    user = relationship("User")


class Portfolio(Base):
    __tablename__ = "portfolios"

    id = Column(Integer, primary_key=True, index=True)
    barber_id = Column(Integer, ForeignKey("barbers.id"), nullable=False)
    image = Column(String, nullable=False)
    description = Column(String, nullable=True)

    barber = relationship("Barber", back_populates="portfolio")
