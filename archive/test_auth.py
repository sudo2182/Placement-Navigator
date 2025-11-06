#!/usr/bin/env python3
"""
Test script to debug authentication issues
"""

import sys
sys.path.append('../')
from shared.enhanced_models import SessionLocal, User
from backend.auth import get_password_hash, verify_password

def test_user_authentication():
    db = SessionLocal()
    try:
        # Test user lookup
        user = db.query(User).filter(User.email == 'john.doe@student.university.edu').first()
        if user:
            print(f"User found: {user.email}")
            print(f"Role: {user.role}")
            print(f"Role type: {type(user.role)}")
            print(f"Role value: {user.role.value if hasattr(user.role, 'value') else 'no value'}")
            
            # Test password verification
            test_password = "password123"
            is_valid = verify_password(test_password, user.password_hash)
            print(f"Password verification: {is_valid}")
            
            # Test role string conversion
            role_str = str(user.role.value) if hasattr(user.role, 'value') else str(user.role)
            print(f"Role string: {role_str}")
            print(f"Role string lower: {role_str.lower()}")
            
        else:
            print("User not found")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_user_authentication()
