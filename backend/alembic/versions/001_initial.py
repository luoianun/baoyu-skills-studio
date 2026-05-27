"""initial tables

Revision ID: 001
Revises:
Create Date: 2026-03-25

"""
from alembic import op
import sqlalchemy as sa

revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # users
    op.create_table('users',
        sa.Column('id', sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('username', sa.String(100), nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('role', sa.Enum('user', 'admin'), nullable=False, server_default='user'),
        sa.Column('credits', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # refresh_tokens
    op.create_table('refresh_tokens',
        sa.Column('id', sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column('user_id', sa.BigInteger(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('token_hash', sa.String(255), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('revoked', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )

    # portfolios
    op.create_table('portfolios',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.BigInteger(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('module', sa.Enum('cover_image', 'infographic', 'article_illustrator', 'comic', 'slide_deck', 'xhs_images', name='module_enum'), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('params', sa.JSON(), nullable=False),
        sa.Column('status', sa.Enum('pending', 'success', 'failed'), nullable=False, server_default='pending'),
        sa.Column('image_paths', sa.JSON(), nullable=True),
        sa.Column('image_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('error_msg', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
    )

    # credit_transactions
    op.create_table('credit_transactions',
        sa.Column('id', sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column('user_id', sa.BigInteger(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('amount', sa.Integer(), nullable=False),
        sa.Column('balance_after', sa.Integer(), nullable=False),
        sa.Column('type', sa.Enum('admin_grant', 'admin_deduct', 'generation'), nullable=False),
        sa.Column('note', sa.String(500), nullable=True),
        sa.Column('operator_id', sa.BigInteger(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('portfolio_id', sa.String(36), sa.ForeignKey('portfolios.id'), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )

def downgrade() -> None:
    op.drop_table('credit_transactions')
    op.drop_table('portfolios')
    op.drop_table('refresh_tokens')
    op.drop_table('users')
