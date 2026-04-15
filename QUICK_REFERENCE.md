# QUICK START REFERENCE GUIDE

## Project Structure

```
smart-attendance/
├── database/                           # PostgreSQL Database
│   ├── schema.sql                      # Main schema (calls migrations)
│   ├── migrations/
│   │   ├── 001_create_tables.sql       # Create all 8 tables
│   │   └── 002_add_indexes.sql         # Performance indexes
│   └── seeds/
│       └── sample_students.sql         # Sample data
│
├── flask-ai/                           # AI/ML Service (Python)
│   ├── run.py                          # Entry point
│   ├── requirements.txt                # Dependencies (TensorFlow, etc.)
│   └── app/
│       ├── __init__.py                 # Flask app factory
│       ├── config.py                   # Configuration (DB, thresholds)
│       ├── routes/                     # API endpoints
│       │   ├── register.py             # POST /api/register
│       │   ├── recognize.py            # POST /api/recognize
│       │   ├── liveness.py             # POST /api/liveness
│       │   └── health.py               # GET /api/health
│       └── utils/                      # Core ML functions
│           ├── face_detect.py          # MTCNN detection
│           ├── face_align.py           # MediaPipe alignment
│           ├── face_embed.py           # FaceNet embedding
│           ├── face_match.py           # Cosine similarity
│           ├── liveness.py             # Blink detection
│           └── db.py                   # PostgreSQL queries
│
├── java-app/                           # Backend API (Spring Boot) - TO DO
│   ├── pom.xml                         # Maven dependencies
│   └── src/main/java/com/attendance/
│       ├── model/                      # Entity classes
│       ├── service/                    # Business logic
│       ├── db/                         # Database layer
│       └── api/                        # REST controllers
│
├── frontend/                           # Web UI (HTML/JS) - TO DO
│   ├── pages/
│   │   ├── login.html
│   │   ├── dashboard.html
│   │   ├── mark-attendance.html
│   │   ├── register-student.html
│   │   └── reports.html
│   ├── js/
│   │   ├── api.js                      # API client
│   │   ├── camera.js                   # Webcam access
│   │   └── utils.js                    # Helper functions
│   └── css/
│       ├── style.css
│       └── dashboard.css
│
├── .env                                # Environment variables
├── .env.example                        # Template
├── run-all.bat                         # Batch script (Windows startup)
└── PROJECT_DOCUMENTATION.md            # Full documentation
```

---

## CORE MODELS SUMMARY

| Model | Input | Output | Purpose | Accuracy |
|-------|-------|--------|---------|----------|
| **MTCNN** | Image | Face Boxes | Detection | 99.9% |
| **MediaPipe** | Face Image | 468 Landmarks | Alignment + Liveness | 98% |
| **FaceNet512** | Aligned Face | 512-D Vector | Embedding | 99.65% |
| **Cosine Similarity** | 2 Vectors | -1 to 1 Score | Matching | Tunable |

---

## API ENDPOINTS

```
POST  /api/register
      Body: { student_id, images: [base64_imgs...] }
      Response: { success, student_id, frames_used, embedding_size }

POST  /api/recognize
      Body: { image: base64_img, course_id, is_live }
      Response: { recognized, student, score, is_live, attendance_marked }

POST  /api/liveness
      Body: { frames: [video_frames...] }
      Response: { is_live, blink_count, confidence }

GET   /api/health
      Response: { status, service, database }
```

---

## FACE RECOGNITION FLOW

```
1. REGISTRATION
   Capture 5-20 images
        ↓
   For each image:
     - Detect face (MTCNN)
     - Align face (MediaPipe)
     - Extract 512-D vector (FaceNet512)
        ↓
   Average all vectors
        ↓
   Store averaged vector in DB
   
2. RECOGNITION
   Capture 1 image
        ↓
   - Detect face (MTCNN)
   - Align face (MediaPipe)
   - Extract 512-D vector (FaceNet512)
        ↓
   Load ALL stored vectors from DB
        ↓
   Compare query vector to each stored vector
   (cosine similarity calculation)
        ↓
   Find BEST match (highest similarity score)
        ↓
   If score >= 0.6:
     ✓ RECOGNIZED → Mark attendance
   Else:
     ✗ NOT RECOGNIZED → Reject
```

---

## LIVENESS DETECTION FLOW

```
Capture 30 frames (1 second video)
        ↓
For each frame:
  - Detect 468 facial landmarks (MediaPipe)
  - Calculate Eye Aspect Ratio (EAR)
  - Track eye state (open/closed)
        ↓
Count eye blinks
        ↓
If blink_count >= 1:
  ✓ LIVE (real person)
Else:
  ✗ SPOOFED (photo or video)
```

---

## KEY CONFIGURATION VALUES

| Parameter | Default | Range | Meaning |
|-----------|---------|-------|---------|
| `SIMILARITY_THRESHOLD` | 0.6 | 0.0-1.0 | Min cosine similarity for match |
| `MIN_BLINK_COUNT` | 1 | 1-5 | Blinks needed for liveness |
| `FRAME_BUFFER_SIZE` | 30 | 10-120 | Frames for liveness analysis |
| `MODEL_NAME` | Facenet512 | Various | Embedding model to use |
| `DETECTOR_BACKEND` | mtcnn | opencv/ssd/dlib | Face detection backend |

---

## PERFORMANCE STATS

- **Registration:** ~3s for 15 images (15×200ms each)
- **Recognition:** ~200ms (detect + align + embed + compare 10K)
- **Liveness:** ~1.4s (30 frames × 47ms + overhead)
- **Throughput:** 4-5 students per second
- **Accuracy:** ~99% (depends on image quality, lighting)

---

## DATABASE TABLES AT A GLANCE

```
FACULTY (Faculty)
  └─ faculty_id (PK), name, email, password, role, is_active

STUDENTS (Student Records)
  └─ student_id (PK), name, roll_number, email, year

COURSES (Courses)
  └─ course_id (PK), course_name, faculty_id (FK)

FACE_ENCODINGS (512-D Vectors) ← CRITICAL
  └─ encoding_id, student_id (FK), encoding_vector (JSON), model_used

ATTENDANCE (Daily Records)
  └─ attendance_id, student_id (FK), course_id (FK), date, time_in,
     status, confidence_score, is_liveness_verified

AUDIT_LOG (Actions)
  └─ log_id, faculty_id (FK), action, details, performed_at
```

---

## DEPLOYMENT CHECKLIST

- [ ] PostgreSQL 12+ installed and running
- [ ] Python 3.11 installed
- [ ] Git clone project
- [ ] Create `.env` file (copy from `.env.example`)
- [ ] Create Python venv: `python -m venv venv`
- [ ] Activate: `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Linux)
- [ ] Install dependencies: `pip install -r flask-ai/requirements.txt`
- [ ] Create PostgreSQL database: `createdb smart_attendance`
- [ ] Load schema: `psql smart_attendance < database/schema.sql`
- [ ] Load seeds: `psql smart_attendance < database/seeds/sample_students.sql`
- [ ] Test Flask-AI: `python flask-ai/run.py` (should start on port 5000)
- [ ] Test health endpoint: `curl http://localhost:5000/api/health`
- [ ] Implement Java backend
- [ ] Implement Frontend
- [ ] Integration testing
- [ ] Deploy to production

---

## TROUBLESHOOTING QUICK FIXES

```bash
# Protobuf/TensorFlow conflict
pip install tensorflow==2.16.1 protobuf==4.25.3 --upgrade

# Missing MediaPipe
pip install mediapipe==0.10.33

# Missing PostgreSQL driver
pip install psycopg2-binary==2.9.10

# Clear Python cache
find . -type d -name __pycache__ -exec rm -r {} +
find . -type f -name "*.pyc" -delete

# Reinstall all dependencies
pip install -r flask-ai/requirements.txt --force-reinstall --no-cache-dir

# Check PostgreSQL connectivity
python -c "import psycopg2; psycopg2.connect('dbname=smart_attendance user=postgres host=localhost')"
```

---

## EXPECTED ENVIRONMENT (.env)

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_attendance
DB_USER=postgres
DB_PASSWORD=postgres
FLASK_HOST=localhost
FLASK_PORT=5000
FLASK_SECRET_KEY=your-secret-key-here
APP_PORT=8080
```

---

## IMPORTANT FILES

| File | Purpose | Edit? |
|------|---------|-------|
| `flask-ai/app/config.py` | Tuning parameters | YES |
| `flask-ai/requirements.txt` | Dependencies | Only if needed |
| `database/migrations/*.sql` | Schema | Only if extending |
| `.env` | Secrets | YES (create locally) |

---

## COMMON ERRORS & FIXES

| Error | Cause | Fix |
|-------|-------|-----|
| `ModuleNotFoundError: No module 'tensorflow'` | Missing dep | `pip install -r flask-ai/requirements.txt` |
| `psycopg2.OperationalError: connection refused` | DB not running | Start PostgreSQL service |
| `No face detected in any image` | Poor quality | Use 5-20 clear images, good lighting |
| `Face not recognized (score 0.4)` | Too strict threshold | Lower SIMILARITY_THRESHOLD in config.py |
| `Cannot connect to runtime_version from google.protobuf` | Version mismatch | Install TF 2.16.1 + protobuf 4.25.3 |

---

**Keep this for reference while working on the project!**
