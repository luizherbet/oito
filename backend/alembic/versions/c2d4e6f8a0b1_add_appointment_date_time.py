"""add appointment_date and appointment_time to appointments

Revision ID: c2d4e6f8a0b1
Revises: f8a91c2d3e4b
Create Date: 2026-04-12

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.exc import ProgrammingError


revision: str = "c2d4e6f8a0b1"
down_revision: Union[str, Sequence[str], None] = "f8a91c2d3e4b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _pg_column_exists(bind, table: str, column: str) -> bool:
    q = sa.text(
        """
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = :tname
          AND column_name = :cname
        LIMIT 1
        """
    )
    return bind.execute(q, {"tname": table, "cname": column}).scalar() is not None


def upgrade() -> None:
    bind = op.get_bind()
    if not _pg_column_exists(bind, "appointments", "appointment_date"):
        try:
            op.add_column(
                "appointments",
                sa.Column("appointment_date", sa.Date(), nullable=True),
            )
        except ProgrammingError:
            if not _pg_column_exists(bind, "appointments", "appointment_date"):
                raise
    if not _pg_column_exists(bind, "appointments", "appointment_time"):
        try:
            op.add_column(
                "appointments",
                sa.Column("appointment_time", sa.Time(), nullable=True),
            )
        except ProgrammingError:
            if not _pg_column_exists(bind, "appointments", "appointment_time"):
                raise
    op.execute(sa.text("UPDATE appointments SET appointment_date = CURRENT_DATE WHERE appointment_date IS NULL"))
    op.execute(
        sa.text(
            "UPDATE appointments SET appointment_time = CAST('09:00:00' AS TIME) "
            "WHERE appointment_time IS NULL"
        )
    )
    op.alter_column(
        "appointments",
        "appointment_date",
        existing_type=sa.Date(),
        nullable=False,
    )
    op.alter_column(
        "appointments",
        "appointment_time",
        existing_type=sa.Time(),
        nullable=False,
    )


def downgrade() -> None:
    bind = op.get_bind()
    if _pg_column_exists(bind, "appointments", "appointment_time"):
        op.drop_column("appointments", "appointment_time")
    if _pg_column_exists(bind, "appointments", "appointment_date"):
        op.drop_column("appointments", "appointment_date")
