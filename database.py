# database.py — Handles all SQLite database operations
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "helpdesk.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def initialize_database():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tickets (
            id          INTEGER  PRIMARY KEY AUTOINCREMENT,
            ticket_id   TEXT     NOT NULL UNIQUE,
            roll_number TEXT     NOT NULL,
            message     TEXT     NOT NULL,
            intent      TEXT     NOT NULL,
            confidence  REAL     NOT NULL,
            status      TEXT     NOT NULL DEFAULT 'Open',
            timestamp   DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()
    print("[DB] Database initialized.")

def save_ticket(ticket_id, roll_number, message, intent, confidence):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO tickets
                (ticket_id, roll_number, message, intent, confidence, status)
            VALUES (?, ?, ?, ?, ?, 'Open')
        """, (ticket_id, roll_number, message, intent, round(confidence, 4)))
        conn.commit()
        conn.close()
        print(f"[DB] Ticket {ticket_id} saved for {roll_number}.")
        return True
    except Exception as e:
        print(f"[DB ERROR] {e}")
        return False

def get_all_tickets():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tickets ORDER BY timestamp DESC")
    tickets = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return tickets

def update_ticket_status(ticket_id, new_status):
    valid = ["Open", "In Progress", "Resolved"]
    if new_status not in valid:
        return False
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE tickets SET status = ? WHERE ticket_id = ?",
                   (new_status, ticket_id))
    conn.commit()
    conn.close()
    return True

def get_ticket_count():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM tickets")
    count = cursor.fetchone()[0]
    conn.close()
    return count