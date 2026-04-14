"""placeholder: revision referenced by DB but missing from repo

Revision ID: af168e7f431c
Revises: 99ed93eed401
Create Date: 2026-04-12

Some bases tinham `alembic_version` = af168e7f431c sem o ficheiro correspondente
no repositório, o que impedia `alembic upgrade`. Esta revisão é um no-op que
restaura a cadeia linear até `f8a91c2d3e4b`.
"""
from typing import Sequence, Union


revision: str = "af168e7f431c"
down_revision: Union[str, Sequence[str], None] = "99ed93eed401"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
