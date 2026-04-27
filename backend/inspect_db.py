from sqlalchemy import create_engine, inspect
import os

DB_USER = os.environ.get('DB_USER', 'root')
DB_PASSWORD = os.environ.get('DB_PASSWORD', '')
DB_HOST = os.environ.get('DB_HOST', 'localhost')
DB_PORT = os.environ.get('DB_PORT', '3307')
DB_NAME = "eeg_pro_db"

SQLALCHEMY_DATABASE_URL = f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_engine(SQLALCHEMY_DATABASE_URL)

inspector = inspect(engine)
columns = inspector.get_columns('users')
print("--- USERS TABLE ---")
for column in columns:
    print(f"{column['name']}: {column['type']}")
