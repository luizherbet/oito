from fastapi import Depends, FastAPI
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.api.routers.auth import router as auth_router
from app.api.routers.search import router as search_router
from app.api.routers.user import router as users_router
from app.api.routers.service import router as services_router
from app.api.routers.schedule import router as schedule_router
from app.api.routers.appointment import router as appointment_router


app = FastAPI()

app.include_router(search_router, prefix="/api/v1", tags=["search"])
app.include_router(auth_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(services_router, prefix="/api/v1")
app.include_router(schedule_router, prefix="/api/v1")
app.include_router(appointment_router, prefix="/api/v1")



@app.get("/health")
def health(db: Session = Depends(get_db)) -> dict[str, str]:
    db.execute(text("SELECT 1"))
    return {"status": "Backend Health"}