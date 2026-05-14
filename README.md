# BarberBook - Modern Barbershop Booking System

A full-stack booking platform built with React + TypeScript frontend and FastAPI + SQLite backend.

## Project Structure

- `frontend` - React + Vite app
- `backend` - FastAPI API with SQLite and SQLAlchemy

## Run Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

- `GET /barbers`
- `GET /services`
- `GET /slots/{barber_id}/{date}`
- `POST /booking`
- `GET /bookings`
- `DELETE /booking/{id}`
