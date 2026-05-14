from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Service
from auth_utils import require_role
from models import User
from schemas import ServiceOut

router = APIRouter(prefix="/services", tags=["Services"])


@router.get("", response_model=list[ServiceOut])
def get_services(db: Session = Depends(get_db), current_user: User = Depends(require_role(["user"]))):
    return db.query(Service).order_by(Service.id).all()
