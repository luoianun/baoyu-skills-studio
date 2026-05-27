#!/usr/bin/env python3
"""Create the initial admin user. Run once from backend/ directory."""
import sys
sys.path.insert(0, '.')

from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import hash_password

def main():
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == 'admin@studio.com').first()
        if existing:
            print("Admin user already exists: admin@studio.com")
            return
        admin = User(
            email='admin@studio.com',
            username='Admin',
            password_hash=hash_password('changeme'),
            role='admin',
            credits=9999,
        )
        db.add(admin)
        db.commit()
        print("Admin created: admin@studio.com / changeme")
        print("IMPORTANT: Change the password after first login!")
    finally:
        db.close()

if __name__ == '__main__':
    main()
