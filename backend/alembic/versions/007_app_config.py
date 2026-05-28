"""Add app_config table

Revision ID: 007
Revises: 006
Create Date: 2026-05-27
"""
from alembic import op
import sqlalchemy as sa

revision = '007'
down_revision = '006'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'app_config',
        sa.Column('key', sa.String(64), primary_key=True),
        sa.Column('value', sa.Text, nullable=False),
        sa.Column('updated_at', sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now()),
    )

def downgrade():
    op.drop_table('app_config')
