from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, SessionLocal, engine
from routes.barber import router as barber_router
from routes.booking import router as booking_router
from routes.service import router as service_router
from routes.auth import router as auth_router
from routes.users import router as users_router
from seed import seed_data

app = FastAPI(title="BarberBook API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()


app.include_router(auth_router)
app.include_router(users_router)
app.include_router(barber_router)
app.include_router(service_router)
app.include_router(booking_router)


@app.get("/")
def health_check():
    return {"message": "BarberBook API is running"}
