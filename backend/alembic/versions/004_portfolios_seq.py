"""add seq auto-increment to portfolios

Revision ID: 004
Revises: 003
Create Date: 2026-03-26

"""
from alembic import op

revision = '004'
down_revision = '003'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.execute(
        "ALTER TABLE portfolios ADD COLUMN seq BIGINT NOT NULL AUTO_INCREMENT UNIQUE"
    )

def downgrade() -> None:
    op.execute("ALTER TABLE portfolios DROP COLUMN seq")
