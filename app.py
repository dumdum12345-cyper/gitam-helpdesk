# app.py — Main Flask Application
import os
from flask import Flask, request, jsonify, send_from_directory
from database import initialize_database, get_all_tickets, update_ticket_status
from model import load_model, predict_intent
from ticket import should_create_ticket, create_ticket

BASE_DIR = os.path.dirname(__file__)
app = Flask(__name__, static_folder=BASE_DIR, static_url_path="")

print("[APP] Loading ML model...")
model = load_model()
print("[APP] Model ready.")

initialize_database()

@app.route("/")
def home():
    return send_from_directory(BASE_DIR, "login.html")

@app.route("/login.html")
def login():
    return send_from_directory(BASE_DIR, "login.html")

@app.route("/index.html")
def index():
    return send_from_directory(BASE_DIR, "index.html")

@app.route("/admin.html")
def admin_page():
    return send_from_directory(BASE_DIR, "admin.html")

@app.route("/chat", methods=["POST"])
def chat():
    data        = request.get_json()
    roll_number = data.get("roll_number", "").strip()
    message     = data.get("message", "").strip()

    if not roll_number or not message:
        return jsonify({"error": "Roll number and message are required."}), 400
    if len(message) < 3:
        return jsonify({"error": "Message too short."}), 400

    intent, confidence, response_text = predict_intent(model, message)
    print(f"[CHAT] {roll_number} | {intent} ({confidence:.2f}) | {message[:40]}")

    ticket_id     = None
    ticket_raised = False
    if should_create_ticket(intent, confidence):
        ticket_id     = create_ticket(roll_number, message, intent, confidence)
        ticket_raised = ticket_id is not None

    return jsonify({
        "intent":        intent,
        "confidence":    round(confidence, 4),
        "response":      response_text,
        "ticket_raised": ticket_raised,
        "ticket_id":     ticket_id
    })

@app.route("/api/tickets")
def api_tickets():
    tickets = get_all_tickets()
    return jsonify(tickets)

@app.route("/admin/update_status", methods=["POST"])
def update_status():
    data       = request.get_json()
    ticket_id  = data.get("ticket_id")
    new_status = data.get("status")
    success    = update_ticket_status(ticket_id, new_status)
    return jsonify({"success": success})

@app.route("/admin/retrain", methods=["POST"])
def retrain():
    global model
    from model import train_and_save_model
    model = train_and_save_model()
    return jsonify({"success": True, "message": "Model retrained."})

if __name__ == "__main__":
    print("=" * 50)
    print("  GITAM Student Helpdesk")
    print("  Open: http://127.0.0.1:5000")
    print("=" * 50)
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)