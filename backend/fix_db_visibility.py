import mysql.connector

DB_USER = 'root'
DB_PASSWORD = ''
DB_PORT = 3307
DB_NAME = "eeg_pro_db"

def fix_db():
    try:
        conn = mysql.connector.connect(
            user=DB_USER,
            password=DB_PASSWORD,
            host='127.0.0.1',
            port=DB_PORT
        )
        cursor = conn.cursor()
        
        # Ensure database exists
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
        print(f"Database '{DB_NAME}' ensured.")
        
        # Select the database
        cursor.execute(f"USE {DB_NAME}")
        
        # Create a dummy table to make it "real"
        cursor.execute("CREATE TABLE IF NOT EXISTS test_visibility (id INT PRIMARY KEY)")
        print("Table 'test_visibility' ensured.")
        
        # Grant privileges just in case
        try:
            cursor.execute(f"GRANT ALL PRIVILEGES ON {DB_NAME}.* TO '{DB_USER}'@'localhost'")
            cursor.execute(f"GRANT ALL PRIVILEGES ON {DB_NAME}.* TO '{DB_USER}'@'127.0.0.1'")
            cursor.execute("FLUSH PRIVILEGES")
            print("Privileges granted.")
        except Exception as ge:
            print(f"Privilege grant warning: {ge}")
            
        cursor.close()
        conn.close()
        print("Success!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_db()
