
import mysql.connector
import os

DB_USER = 'root'
DB_PASSWORD = ''
DB_HOST = 'localhost'
DB_PORT = 3307
DB_NAME = "eeg_pro_db"

try:
    print(f"Connecting to {DB_HOST}:{DB_PORT} as {DB_USER}...")
    conn = mysql.connector.connect(
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    print("Connection successful!")
    cursor = conn.cursor()
    cursor.execute("SHOW DATABASES")
    databases = cursor.fetchall()
    print("Databases:", databases)
    cursor.close()
    conn.close()
except Exception as e:
    print(f"FAILED to connect: {e}")
