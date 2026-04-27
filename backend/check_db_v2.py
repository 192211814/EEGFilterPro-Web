import mysql.connector

DB_USER = 'root'
DB_PASSWORD = ''
DB_PORT = 3307
DB_NAME = "eeg_pro_db"

def check_host(host):
    try:
        conn = mysql.connector.connect(
            user=DB_USER,
            password=DB_PASSWORD,
            host=host,
            port=DB_PORT
        )
        cursor = conn.cursor()
        cursor.execute("SHOW DATABASES")
        databases = [db[0] for db in cursor.fetchall()]
        print(f"Databases on {host}:{DB_PORT}: {databases}")
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error connecting to {host}:{DB_PORT}: {e}")

if __name__ == "__main__":
    check_host('localhost')
    check_host('127.0.0.1')
