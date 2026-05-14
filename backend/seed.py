from sqlalchemy.orm import Session
import json

from models import Barber, Service, Portfolio


BARBERS = [
    {
        "id": 1, 
        "name": "John", 
        "specialization": "Fade Specialist", 
        "experience": "5y", 
        "rating": 4.8, 
        "image": "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop", 
        "location": "Downtown Central",
        "working_hours": "09:00-18:00",
        "price": 25.0,
        "availability": json.dumps(["14:00", "14:30"])
    },
    {
        "id": 2, 
        "name": "Alex", 
        "specialization": "Beard Expert", 
        "experience": "3y", 
        "rating": 4.6, 
        "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop", 
        "location": "West Side Plaza",
        "working_hours": "10:00-19:00",
        "price": 20.0
    },
    {
        "id": 3, 
        "name": "Mike", 
        "specialization": "Classic Cuts", 
        "experience": "7y", 
        "rating": 4.9, 
        "image": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop", 
        "location": "Old Town Square",
        "working_hours": "09:00-17:00",
        "price": 30.0
    },
    {
        "id": 4, 
        "name": "David", 
        "specialization": "Skin Fade Pro", 
        "experience": "4y", 
        "rating": 4.7, 
        "image": "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=400&h=400&fit=crop", 
        "location": "City Center",
        "working_hours": "08:00-16:00",
        "price": 22.0
    },
    {
        "id": 5, 
        "name": "Chris", 
        "specialization": "Modern Styles", 
        "experience": "6y", 
        "rating": 4.8, 
        "image": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop", 
        "location": "North Hills",
        "working_hours": "11:00-20:00",
        "price": 28.0
    },
]

SERVICES = [
    {"id": 1, "name": "Haircut", "duration": 30, "price": 25},
    {"id": 2, "name": "Beard Trim", "duration": 20, "price": 18},
    {"id": 3, "name": "Haircut + Beard", "duration": 50, "price": 40},
    {"id": 4, "name": "VIP Grooming", "duration": 60, "price": 60},
    {"id": 5, "name": "Kids Haircut", "duration": 25, "price": 20},
]


def seed_data(db: Session) -> None:
    from models import User
    from auth_utils import get_password_hash

    # Create admin
    if db.query(User).filter(User.email == "admin@gmail.com").count() == 0:
        admin_user = User(
            name="Admin",
            email="admin@gmail.com",
            password=get_password_hash("admin123"),
            role="admin"
        )
        db.add(admin_user)
        db.commit()

    # Create a test barber user
    if db.query(User).filter(User.email == "barber@gmail.com").count() == 0:
        barber_user = User(
            name="John",
            email="barber@gmail.com",
            password=get_password_hash("barber123"),
            role="barber"
        )
        db.add(barber_user)
        db.commit()

    if db.query(Service).count() == 0:
        for service in SERVICES:
            db.add(Service(**service))
        db.commit()

    if db.query(Barber).count() == 0:
        for i, barber_data in enumerate(BARBERS):
            # Link the first barber to our test barber user
            if barber_data["name"] == "John":
                test_user = db.query(User).filter(User.email == "barber@gmail.com").first()
                barber_data["user_id"] = test_user.id
            db.add(Barber(**barber_data))
        db.commit()

    # Seed some portfolio items for John
    john = db.query(Barber).filter(Barber.name == "John").first()
    if john and db.query(Portfolio).filter(Portfolio.barber_id == john.id).count() == 0:
        portfolio_items = [
            {
                "barber_id": john.id,
                "image": "https://images.unsplash.com/photo-1621605815841-2cd610020182?w=500&h=500&fit=crop",
                "description": "Clean skin fade with textured top."
            },
            {
                "barber_id": john.id,
                "image": "https://images.unsplash.com/photo-1592647425550-8fe915cfa1f7?w=500&h=500&fit=crop",
                "description": "Classic pompadour styling."
            }
        ]
        for item in portfolio_items:
            db.add(Portfolio(**item))
        db.commit()
