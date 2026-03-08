# ticket.py — Ticket ID generation and creation logic
from database import save_ticket, get_ticket_count

CONFIDENCE_THRESHOLD = 0.60
COMPLAINT_INTENT = "complaint"

def should_create_ticket(intent, confidence):
    if intent == COMPLAINT_INTENT:
        return True
    if confidence < CONFIDENCE_THRESHOLD:
        return True
    return False

def generate_ticket_id():
    count = get_ticket_count()
    return f"TKT-{count + 1:04d}"

def create_ticket(roll_number, message, intent, confidence):
    ticket_id = generate_ticket_id()
    success = save_ticket(ticket_id, roll_number, message, intent, confidence)
    if success:
        print(f"[TICKET] Created {ticket_id} for {roll_number}")
        return ticket_id
    return None