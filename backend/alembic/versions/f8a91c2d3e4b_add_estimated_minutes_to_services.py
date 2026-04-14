"""add estimated_minutes to services

Revision ID: f8a91c2d3e4b
Revises: af168e7f431c
Create Date: 2026-04-12

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.exc import ProgrammingError


revision: str = "f8a91c2d3e4b"
down_revision: Union[str, Sequence[str], None] = "af168e7f431c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _pg_column_exists(bind, table: str, column: str) -> bool:
    """Detecta coluna em qualquer schema (evita falhas se não for `public`)."""
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
    if not _pg_column_exists(bind, "services", "estimated_minutes"):
        try:
            op.add_column(
                "services",
                sa.Column("estimated_minutes", sa.Integer(), nullable=True),
            )
        except ProgrammingError:
            if not _pg_column_exists(bind, "services", "estimated_minutes"):
                raise
    op.execute(
        sa.text("UPDATE services SET estimated_minutes = 60 WHERE estimated_minutes IS NULL")
    )
    op.alter_column(
        "services",
        "estimated_minutes",
        existing_type=sa.Integer(),
        nullable=False,
    )


def downgrade() -> None:
    bind = op.get_bind()
    if _pg_column_exists(bind, "services", "estimated_minutes"):
        op.drop_column("services", "estimated_minutes")
