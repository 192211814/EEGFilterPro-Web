import mysql.connector
import os

DB_USER = 'root'
DB_PASSWORD = ''
DB_PORT = 3307
DB_NAME = "eeg_pro_db"
SQL_FILE = 'create_tables.sql'

def run_sql():
    try:
        conn = mysql.connector.connect(
            user=DB_USER,
            password=DB_PASSWORD,
            host='127.0.0.1',
            port=DB_PORT
        )
        cursor = conn.cursor()
        
        with open(SQL_FILE, 'r') as f:
            sql_script = f.read()
            
        # Split script by semicolon
        commands = sql_script.split(';')
        for command in commands:
            if command.strip():
                cursor.execute(command)
                
        conn.commit()
        print(f"Successfully executed {SQL_FILE} on port {DB_PORT}")
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    run_sql()
