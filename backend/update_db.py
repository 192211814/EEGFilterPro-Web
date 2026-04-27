import mysql.connector
import os
from database import DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME

def update_tables():
    try:
        conn = mysql.connector.connect(
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=int(DB_PORT),
            database=DB_NAME
        )
        cursor = conn.cursor()
        
        # Check users table columns
        cursor.execute("SHOW COLUMNS FROM users")
        columns = [col[0] for col in cursor.fetchall()]
        
        if 'reset_otp' not in columns:
            print("Adding reset_otp column to users table...")
            cursor.execute("ALTER TABLE users ADD COLUMN reset_otp VARCHAR(6)")
        
        if 'otp_expiry' not in columns:
            print("Adding otp_expiry column to users table...")
            cursor.execute("ALTER TABLE users ADD COLUMN otp_expiry DATETIME")
            
        if 'last_name' in columns:
            print("Removing last_name column from users table...")
            cursor.execute("ALTER TABLE users DROP COLUMN last_name")
            
        conn.commit()
        print("Database schema updated successfully (if needed).")
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error updating database: {e}")

if __name__ == "__main__":
    update_tables()
