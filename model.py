# model.py — ML Intent Classification using TF-IDF + Logistic Regression
import os
import pickle
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

MODEL_DIR  = os.path.join(os.path.dirname(__file__), "model_data")
MODEL_PATH = os.path.join(MODEL_DIR, "intent_model.pkl")

TRAINING_DATA = [
    # FEES
    ("What is the last date to pay fees?",              "fees"),
    ("How can I pay my tuition fees online?",           "fees"),
    ("My fee receipt is not generated",                 "fees"),
    ("Is there a fee waiver for poor students?",        "fees"),
    ("What are the hostel fee charges?",                "fees"),
    ("When is the exam fee submission deadline?",       "fees"),
    ("Fee payment portal is not working",               "fees"),
    ("I need a duplicate fee receipt",                  "fees"),
    ("Can I pay fees in installments?",                 "fees"),
    ("Fee structure for second year students",          "fees"),
    ("Late fee fine details",                           "fees"),
    ("How to get fee concession?",                      "fees"),
    ("Bus fee payment process",                         "fees"),
    ("Scholarship deduction from fees",                 "fees"),
    ("I want to pay my semester fees",                  "fees"),
    # EXAMS
    ("When is the exam timetable released?",            "exams"),
    ("How do I apply for re-evaluation?",               "exams"),
    ("I missed my exam due to medical reasons",         "exams"),
    ("What is the passing marks criteria?",             "exams"),
    ("Where can I find previous year question papers?", "exams"),
    ("My exam hall ticket is not available",            "exams"),
    ("Can I get a copy of my answer sheet?",            "exams"),
    ("Internal exam marks are not updated",             "exams"),
    ("I need to apply for backlog exam",                "exams"),
    ("Exam schedule for final year students",           "exams"),
    ("My result has not been declared yet",             "exams"),
    ("How to check exam result online?",                "exams"),
    ("Grace marks policy for attendance shortage",      "exams"),
    ("Theory and practical exam dates",                 "exams"),
    ("Hall ticket download link",                       "exams"),
    # ACADEMICS
    ("How do I change my elective subject?",            "academics"),
    ("I need my bonafide certificate",                  "academics"),
    ("Course registration deadline for next semester",  "academics"),
    ("How to calculate CGPA?",                          "academics"),
    ("My attendance is below 75 percent",               "academics"),
    ("Can I get a transcript of my grades?",            "academics"),
    ("Syllabus for third semester computer science",    "academics"),
    ("How to get a no-objection certificate?",          "academics"),
    ("My name is wrongly spelled in mark sheet",        "academics"),
    ("Internship credit transfer process",              "academics"),
    ("Minimum CGPA for placement eligibility",          "academics"),
    ("I need a recommendation letter from professor",   "academics"),
    ("How many elective credits are required?",         "academics"),
    ("Who is my academic advisor?",                     "academics"),
    ("I want to apply for lateral entry transfer",      "academics"),
    # HOSTEL
    ("How do I apply for hostel accommodation?",        "hostel"),
    ("My hostel room has no water supply",              "hostel"),
    ("Can I change my hostel room?",                    "hostel"),
    ("What are the hostel curfew timings?",             "hostel"),
    ("I need a hostel leaving certificate",             "hostel"),
    ("Hostel mess food quality is very bad",            "hostel"),
    ("Wi-Fi is not working in the hostel",              "hostel"),
    ("Hostel maintenance issue",                        "hostel"),
    ("Hostel warden is not responding",                 "hostel"),
    ("Hostel allotment result is not published",        "hostel"),
    ("Hostel deposit refund process",                   "hostel"),
    ("My hostel room lock is broken",                   "hostel"),
    ("Rules and regulations for hostel students",       "hostel"),
    ("How to apply for guest room in hostel?",          "hostel"),
    ("Can day scholars get temporary hostel access?",   "hostel"),
    # COMPLAINT
    ("I want to file a complaint against a staff member",   "complaint"),
    ("A teacher is behaving rudely with students",          "complaint"),
    ("I am being harassed by another student",              "complaint"),
    ("I want to report sexual harassment",                  "complaint"),
    ("Ragging is happening in my hostel block",             "complaint"),
    ("I want to escalate my unresolved issue",              "complaint"),
    ("I want to raise a grievance against admin office",    "complaint"),
    ("My scholarship has been wrongly cancelled",           "complaint"),
    ("I was wrongly marked absent in the exam",             "complaint"),
    ("Professor is not teaching properly",                  "complaint"),
    ("I need to lodge an official complaint",               "complaint"),
    ("Discrimination based on caste in the classroom",      "complaint"),
    ("My complaint against warden was ignored",             "complaint"),
    ("I want to report a problem",                          "complaint"),
    ("My complaint was not addressed for two weeks",        "complaint"),
]

TEXTS  = [item[0] for item in TRAINING_DATA]
LABELS = [item[1] for item in TRAINING_DATA]

RESPONSES = {
    "fees": (
        "💰 <strong>Fees Information</strong><br>"
        "For fee-related queries, visit the <em>Finance Office</em> (Room 102, Admin Block) "
        "or use <em>Student Portal → Fee Payment</em>. "
        "Fee receipts and challans are available online. "
        "Office hours: Mon–Fri, 9 AM – 4 PM."
    ),
    "exams": (
        "📋 <strong>Examination Information</strong><br>"
        "For exam queries, check the <em>Examination Cell</em> notice board "
        "or visit the Exam Controller's Office (Room 210, Academic Block). "
        "Hall tickets, timetables, and re-evaluation forms are on the Student Portal."
    ),
    "academics": (
        "🎓 <strong>Academic Information</strong><br>"
        "For academic queries, contact your <em>Department Coordinator</em> "
        "or visit the Academic Section (Ground Floor, Admin Block). "
        "Transcripts, bonafide certificates, and NOCs via Student Portal."
    ),
    "hostel": (
        "🏠 <strong>Hostel Information</strong><br>"
        "For hostel queries, contact your <em>Hostel Warden</em> "
        "or visit the Hostel Office (Hostel Admin Block). "
        "Room allotments and maintenance requests handled by Hostel Committee."
    ),
    "complaint": (
        "🚨 <strong>Complaint Received</strong><br>"
        "Your complaint has been recorded and a support ticket has been raised. "
        "Our grievance team will contact you within <em>48 working hours</em>. "
        "Please note your Ticket ID for tracking."
    ),
}

def train_and_save_model():
    print("[MODEL] Training intent classification model...")
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=3000,
            stop_words="english",
            sublinear_tf=True
        )),
        ("clf", LogisticRegression(
            max_iter=1000,
            C=5.0,
            solver="lbfgs",
        ))
    ])
    pipeline.fit(TEXTS, LABELS)

    # Evaluation on test split
    X_tr, X_te, y_tr, y_te = train_test_split(
        TEXTS, LABELS, test_size=0.2, random_state=42
    )
    eval_pipe = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1,2), max_features=3000,
                                   stop_words="english", sublinear_tf=True)),
        ("clf",   LogisticRegression(max_iter=1000, C=5.0, solver="lbfgs"))
    ])
    eval_pipe.fit(X_tr, y_tr)
    print("\n[MODEL] Accuracy Report:")
    print(classification_report(y_te, eval_pipe.predict(X_te)))

    os.makedirs(MODEL_DIR, exist_ok=True)
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(pipeline, f)
    print(f"[MODEL] Saved to {MODEL_PATH}")
    return pipeline

def load_model():
    if os.path.exists(MODEL_PATH):
        print("[MODEL] Loading saved model...")
        with open(MODEL_PATH, "rb") as f:
            return pickle.load(f)
    else:
        print("[MODEL] No saved model. Training now...")
        return train_and_save_model()

def predict_intent(model, user_message):
    intent     = model.predict([user_message])[0]
    probs      = model.predict_proba([user_message])[0]
    confidence = float(np.max(probs))
    response   = RESPONSES.get(intent, "Thank you. Our team will assist you shortly.")
    return intent, confidence, response