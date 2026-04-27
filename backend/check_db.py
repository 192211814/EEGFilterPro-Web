import mysql.connector
import os

DB_USER = 'root'
DB_PASSWORD = ''
DB_HOST = 'localhost'
DB_PORT = 3307
DB_NAME = "eeg_pro_db"

def check_db():
    try:
        conn = mysql.connector.connect(
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
        cursor = conn.cursor()
        cursor.execute("SHOW DATABASES")
        databases = [db[0] for db in cursor.fetchall()]
        print(f"Databases on port {DB_PORT}: {databases}")
        if DB_NAME in databases:
            print(f"SUCCESS: Database '{DB_NAME}' exists on port {DB_PORT}.")
        else:
            print(f"WARNING: Database '{DB_NAME}' DOES NOT exist on port {DB_PORT}.")
        
        # Also check 3306 just in case
        try:
             conn3306 = mysql.connector.connect(
                user=DB_USER,
                password=DB_PASSWORD,
                host=DB_HOST,
                port=3306
            )
             cursor3306 = conn3306.cursor()
             cursor3306.execute("SHOW DATABASES")
             dbs3306 = [db[0] for db in cursor3306.fetchall()]
             print(f"Databases on port 3306: {dbs3306}")
             if DB_NAME in dbs3306:
                 print(f"SUCCESS: Database '{DB_NAME}' exists on port 3306.")
             cursor3306.close()
             conn3306.close()
        except:
            print("Could not connect to port 3306")
            
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error connecting to port {DB_PORT}: {e}")

if __name__ == "__main__":
    check_db()
