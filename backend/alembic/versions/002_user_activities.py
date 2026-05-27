"""add user_activities table

Revision ID: 002
Revises: 001
Create Date: 2026-03-25

"""
from alembic import op
import sqlalchemy as sa

revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table('user_activities',
        sa.Column('id', sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column('user_id', sa.BigInteger(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.UniqueConstraint('user_id', 'date', name='uq_user_date'),
    )

def downgrade() -> None:
    op.drop_table('user_activities')
