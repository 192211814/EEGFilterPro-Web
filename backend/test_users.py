
import mysql.connector

DB_USER = 'root'
DB_PASSWORD = ''
DB_HOST = 'localhost'
DB_PORT = 3307
DB_NAME = "eeg_pro_db"

try:
    conn = mysql.connector.connect(
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME
    )
    print("Connected to eeg_pro_db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email FROM users LIMIT 1")
    user = cursor.fetchone()
    if user:
        print(f"Found user: {user}")
    else:
        print("No users found in table.")
    cursor.close()
    conn.close()
except Exception as e:
    print(f"FAILED to query users: {e}")
