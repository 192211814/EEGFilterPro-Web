from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# XAMPP MySQL Settings
DB_USER = os.environ.get('DB_USER', 'root')
DB_PASSWORD = os.environ.get('DB_PASSWORD', '')
DB_HOST = os.environ.get('DB_HOST', '127.0.0.1')
DB_PORT = os.environ.get('DB_PORT', '3306')
DB_NAME = "eeg_pro_db"

# Using mysqlconnector as it's already in requirements
SQLALCHEMY_DATABASE_URL = f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Create engine (mysql+mysqlconnector)
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_user_by_email(email: str):
    """Get a user by email address."""
    from models import User
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if user:
            return {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "password_hash": user.password_hash,
                "created_at": user.created_at.isoformat() if user.created_at else None
            }
        return None
    finally:
        db.close()

def get_user_by_id(user_id: int):
    """Get a user by ID."""
    from models import User
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            return {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "created_at": user.created_at.isoformat() if user.created_at else None
            }
        return None
    finally:
        db.close()

def create_user(name: str, email: str, password_hash: str):
    """Create a new user and return their ID."""
    from models import User
    db = SessionLocal()
    try:
        new_user = User(name=name, email=email, password_hash=password_hash)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user.id
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()

def init_db():
    import models
    # Create database if not exists using a raw connection
    import mysql.connector
    try:
        conn = mysql.connector.connect(
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=int(DB_PORT)
        )
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
        
        # Connect to the db and check for missing columns
        cursor.execute(f"USE {DB_NAME}")
        
        # FIX: Ensure password_hash is long enough
        try:
            print("Ensuring 'password_hash' column is VARCHAR(255)...")
            cursor.execute("ALTER TABLE users MODIFY COLUMN password_hash VARCHAR(255) NOT NULL")
            # Update Admin User hash to valid 60-char bcrypt hash for 'password123'
            admin_hash = '$2b$12$CmCk5z6TSZLdzNI1PAvEU.w/cDxniG3OIwR1pV41c3jqkRXm1a37i'
            cursor.execute("UPDATE users SET password_hash = %s WHERE email = %s AND LENGTH(password_hash) < 60", (admin_hash, 'admin@example.com'))
            conn.commit()
        except Exception as fe:
            print(f"Error fixing password_hash column/data: {fe}")

        cursor.execute("SHOW TABLES LIKE 'users'")
        if cursor.fetchone():
            cursor.execute("SHOW COLUMNS FROM users")
            columns = [col[0].lower() for col in cursor.fetchall()]
            if 'phone' not in columns:
                cursor.execute("ALTER TABLE users ADD COLUMN phone VARCHAR(20)")
            if 'institution' not in columns:
                cursor.execute("ALTER TABLE users ADD COLUMN institution VARCHAR(255)")
            if 'department' not in columns:
                cursor.execute("ALTER TABLE users ADD COLUMN department VARCHAR(255)")
            if 'profile_image' not in columns:
                cursor.execute("ALTER TABLE users ADD COLUMN profile_image VARCHAR(255)")
            if 'reset_otp' not in columns:
                cursor.execute("ALTER TABLE users ADD COLUMN reset_otp VARCHAR(6)")
            if 'otp_expiry' not in columns:
                cursor.execute("ALTER TABLE users ADD COLUMN otp_expiry DATETIME")
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error initializing/updating database: {e}")

    # Create tables (Base.metadata only creates if they DON'T exist)
    Base.metadata.create_all(bind=engine)
