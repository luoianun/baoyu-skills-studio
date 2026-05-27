"""add index on portfolio completed_at and status

Revision ID: 005
Revises: 004
Create Date: 2026-03-26

"""
from alembic import op

revision = '005'
down_revision = '004'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.execute("ALTER TABLE portfolios ADD INDEX ix_portfolios_status_completed (status, completed_at)")

def downgrade() -> None:
    op.execute("ALTER TABLE portfolios DROP INDEX ix_portfolios_status_completed")
