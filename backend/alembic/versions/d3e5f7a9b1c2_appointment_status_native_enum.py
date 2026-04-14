"""appointments.status as Postgres ENUM appointment_status_enum

Revision ID: d3e5f7a9b1c2
Revises: c2d4e6f8a0b1
Create Date: 2026-04-12

Alinha a coluna com SAEnum(AppointmentStatus, name="appointment_status_enum").
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d3e5f7a9b1c2"
down_revision: Union[str, Sequence[str], None] = "c2d4e6f8a0b1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

ENUM_NAME = "appointment_status_enum"


def _status_udt_name(bind) -> str | None:
    row = bind.execute(
        sa.text(
            """
            SELECT udt_name
            FROM information_schema.columns
            WHERE table_name = 'appointments'
              AND column_name = 'status'
            LIMIT 1
            """
        )
    ).scalar()
    return str(row) if row else None


def upgrade() -> None:
    bind = op.get_bind()
    op.execute(
        sa.text(
            f"""
            DO $$ BEGIN
                CREATE TYPE {ENUM_NAME} AS ENUM (
                    'pending', 'confirmed', 'cancelled', 'completed'
                );
            EXCEPTION
                WHEN duplicate_object THEN NULL;
            END $$;
            """
        )
    )
    udt = _status_udt_name(bind)
    if udt == ENUM_NAME:
        return
    op.execute(
        sa.text(
            f"""
            ALTER TABLE appointments
            ALTER COLUMN status TYPE {ENUM_NAME}
            USING (status::text::{ENUM_NAME});
            """
        )
    )


def downgrade() -> None:
    bind = op.get_bind()
    udt = _status_udt_name(bind)
    if udt != ENUM_NAME:
        return
    op.execute(
        sa.text(
            """
            ALTER TABLE appointments
            ALTER COLUMN status TYPE TEXT
            USING (status::text);
            """
        )
    )
    op.execute(sa.text(f"DROP TYPE IF EXISTS {ENUM_NAME}"))
