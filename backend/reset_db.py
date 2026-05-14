import os
from database import Base, engine, SessionLocal
from seed import seed_data
# Import models to ensure they are registered with Base
from models import Barber, Service, User, Booking

def reset_db():
    print("Resetting database...")
    
    # Close connections before dropping (especially for SQLite)
    engine.dispose()
    
    # Drop all tables
    Base.metadata.drop_all(bind=engine)
    print("Tables dropped.")
    
    # Recreate all tables
    Base.metadata.create_all(bind=engine)
    print("Tables recreated.")
    
    # Seed data
    db = SessionLocal()
    try:
        seed_data(db)
        print("Data seeded successfully.")
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    reset_db()
