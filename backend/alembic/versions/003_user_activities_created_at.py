"""rebuild user_activities with created_at and remove unique constraint

Revision ID: 003
Revises: 002
Create Date: 2026-03-26

"""
from alembic import op
import sqlalchemy as sa

revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.drop_table('user_activities')
    op.create_table('user_activities',
        sa.Column('id', sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column('user_id', sa.BigInteger(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_user_activities_date', 'user_activities', ['date'])
    op.create_index('ix_user_activities_user_id', 'user_activities', ['user_id'])

def downgrade() -> None:
    op.drop_table('user_activities')
    op.create_table('user_activities',
        sa.Column('id', sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column('user_id', sa.BigInteger(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.UniqueConstraint('user_id', 'date', name='uq_user_date'),
    )
