"""portfolio soft delete

Revision ID: 006
Revises: 005
Create Date: 2026-03-27
"""
from alembic import op
import sqlalchemy as sa

revision = '006'
down_revision = '005'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('portfolios', sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='0'))


def downgrade():
    op.drop_column('portfolios', 'is_deleted')
