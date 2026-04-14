from datetime import datetime, timezone
from sqlalchemy import Enum as SAEnum
from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String, Time
from sqlalchemy.orm import relationship
from app.enums import AppointmentStatus

from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)

    client_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    professional_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    appointment_date = Column(Date, nullable=False)
    appointment_time = Column(Time, nullable=False)
    status = Column(
        SAEnum(AppointmentStatus, name="appointment_status_enum"),
        nullable=False,
        default=AppointmentStatus.pending,
    )
    notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now)

    client = relationship(
        "User",
        foreign_keys=[client_id],
        back_populates="appointments_as_client",
    )
    professional = relationship(
        "User",
        foreign_keys=[professional_id],
        back_populates="appointments_as_professional",
    )
    service = relationship("Service", back_populates="appointments")
