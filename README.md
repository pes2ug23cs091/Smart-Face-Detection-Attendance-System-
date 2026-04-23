#Smart Face Detection Attendance System

A comprehensive attendance system using face recognition with Flask AI backend, Java Spring Boot API, and web frontend.

## Project Architecture

```
├── flask-ai/           # AI/ML service for face recognition
├── java-app/           # Spring Boot REST API and business logic
├── frontend/           # Web dashboard and interfaces
├── database/           # PostgreSQL schemas and migrations
└── stored_faces/       # Face embeddings storage
```

---

## Prerequisites

### Required Software
- **Java 11+** (for Spring Boot)
- **Python 3.8+** (for Flask AI service)
- **MongoDB** (running on localhost:27017)
- **PostgreSQL** (optional, for relational data)
- **Node.js + npm** (optional, for frontend development server)

### Download & Install
1. **Java**: https://www.oracle.com/java/technologies/
2. **Python**: https://www.python.org/downloads/
3. **MongoDB**: https://www.mongodb.com/try/download/community
4. **PostgreSQL**: https://www.postgresql.org/download/

---

## Installation & Setup

### 1. Flask AI Service Setup

```powershell
# Navigate to flask-ai directory
cd flask-ai

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
.\venv\Scripts\Activate.ps1

# Or on Mac/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Java Application Setup

```powershell
# Navigate to java-app directory
cd java-app

# Build with Maven
mvn clean install

# Or if Maven not installed, ensure Java 11+ is available
javac -version
```

### 3. Frontend Setup (Optional - for development)

```powershell
# No build required for static deployment
# For development server:
cd frontend

# Using Python's built-in server
python -m http.server 8000

# Or using Node.js
npx http-server -p 8000
```

### 4. Database Setup

```powershell
# PostgreSQL - Optional for relational data
# Import schema using PostgreSQL client or pgAdmin
psql -U postgres -d smart_attendance < database/schema.sql

# Or apply migrations individually
psql -U postgres -d smart_attendance < database/migrations/001_create_tables.sql
psql -U postgres -d smart_attendance < database/migrations/002_add_indexes.sql

# Load sample data (optional)
psql -U postgres -d smart_attendance < database/seeds/sample_students.sql
```

---

## Running the Application

### Option 1: Run All Services (Windows)

```powershell
# From project root
.\run-all.bat
```

### Option 2: Run Services Individually

#### Terminal 1 - Flask AI Service (Port 5000)
```powershell
cd flask-ai

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Run Flask server
python run.py
```

**Flask AI Service will be available at**: `http://127.0.0.1:5000`

#### Terminal 2 - Java Spring Boot (Port 8080)
```powershell
cd java-app

# Run Spring Boot application
mvn spring-boot:run

# Or run the compiled JAR
java -jar target/smart-attendance-0.0.1-SNAPSHOT.jar
```

**Java API will be available at**: `http://localhost:8080`

#### Terminal 3 - Frontend (Port 8000)
```powershell
cd frontend

# Option A: Python HTTP Server
mvn spring-boot:run

# Option B: Node.js HTTP Server
npx http-server -p 8000
```

**Frontend will be available at**: `http://localhost:8000`

#### MongoDB
Ensure MongoDB is running:
```powershell
# Windows - if installed as service
# It should start automatically

# Or run manually
mongod --dbpath "C:\data\db"
```

---

## Access Points

| Service | URL | Port |
|---------|-----|------|
| Frontend Dashboard | http://localhost:8000 | 8000 |
| Java API (REST) | http://localhost:8080 | 8080 |
| Flask AI Service | http://127.0.0.1:5000 | 5000 |
| MongoDB | mongodb://localhost:27017 | 27017 |

---

## Configuration

### Java Application Settings
File: `java-app/src/main/resources/application.properties`

```properties
server.port=8080
spring.data.mongodb.uri=mongodb://localhost:27017/smart_attendance
app.jwt.secret=ChangeThisSecretKeyToSomethingLongAndRandom
app.jwt.expiration-minutes=480
app.ai.base-url=http://127.0.0.1:5000
app.cors.allowed-origins=http://localhost:8000,http://127.0.0.1:8000
```

### Flask AI Service Settings
File: `flask-ai/app/config.py`

Update configurations as needed for your environment.

---

## Password Management System

### How Passwords Are Created

The system implements a **role-based password creation process** for security:

#### For Students:
1. **Faculty** registers a new student in the system
2. Faculty clicks **"Generate"** button to create a temporary password (format: `Temp_XXXXXX`)
3. Student details (name, ID) and password are captured during face registration
4. **After successful registration**, the password is displayed in a modal to the Faculty
5. Faculty **shares the password securely** with the student (in-person or via secure channel)
6. Student uses **Student ID (or Roll Number)** + **password** to login
7. Student can **change password** after first login

#### For Faculty:
1. **Admin** accesses Admin Dashboard
2. Admin fills in faculty details and clicks **"Generate"** button
3. Admin reviews the auto-generated temporary password (format: `Temp_XXXXXX`)
4. Faculty is created with this password
5. **After faculty creation**, the password is displayed in a modal to Admin
6. Admin **shares the password securely** with faculty (in-person or via secure channel)
7. Faculty uses **Email** + **password** to login
8. Faculty can **change password** after first login

### Password Features

- **Temporary Format**: Generated passwords follow pattern `Temp_XXXXXX` (6 random alphanumeric characters)
- **Display Only Once**: Passwords are shown only immediately after registration
- **Copy to Clipboard**: Modal provides easy copy button for secure sharing
- **Password Strength**: Validated for security (minimum 8 chars, uppercase, number)
- **Secure Storage**: Passwords are hashed using Spring Security's `PasswordEncoder`

### Login Process

**Faculty Login:**
```
Email: faculty@college.edu
Password: [Password shared by Admin]
```

**Student Login:**
```
Student ID or Roll Number: 21CS001 (or numeric ID)
Password: [Password shared by Faculty]
```

**Admin Login:**
```
Email: admin@college.edu
Password: [Default or custom admin password]
```

---

## Features

- **Face Recognition**: Real-time face detection and matching
- **Student Registration**: Faculty register students with face data and auto-generated passwords
- **Faculty Registration**: Admin registers faculty with auto-generated passwords
- **Secure Password Management**: Passwords generated and displayed only once during registration
- **Attendance Marking**: Mark attendance via face recognition
- **Admin Dashboard**: Manage users, courses, and attendance
- **Faculty Portal**: View attendance reports and register students
- **Student Dashboard**: Check personal attendance
- **Face Liveness Detection**: Prevent spoofing attacks
- **JWT Authentication**: Secure API endpoints

---

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Students
- `GET /api/students` - List all students
- `POST /api/students` - Create new student
- `GET /api/students/{id}` - Get student details

### Attendance
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance/report` - Get attendance report

### Face Recognition
- `POST /api/face/register` - Register face data
- `POST /api/face/recognize` - Recognize face

### Health Check
- `GET /api/health` - Check API status

---

## Troubleshooting

### Flask Service Issues
- **ModuleNotFoundError**: Ensure virtual environment is activated and dependencies installed
- **Port 5000 in use**: Kill process on port 5000 or change port in `run.py`

### Java Application Issues
- **MongoDB connection failed**: Ensure MongoDB is running on port 27017
- **Build fails**: Run `mvn clean` first, then `mvn clean install`

### Frontend Issues
- **CORS errors**: Check allowed origins in `application.properties`
- **API not responding**: Verify Java and Flask services are running
- **Password modal not showing**: Ensure `password-utils.js` is loaded in the page

### Database Issues
- **Connection refused**: Ensure PostgreSQL/MongoDB services are running
- **Schema errors**: Drop existing database and re-run schema.sql

### Password Issues
- **Lost password**: Admin can reset faculty passwords via Admin Dashboard; Faculty can reset student passwords during new registration
- **Password not saved**: Ensure you save the password when the modal appears as it's shown only once
- **Invalid credentials**: Verify you're using the correct username (email for faculty, Student ID/Roll for students)

---

## Project Structure

```
smart-attendance/
├── flask-ai/                      # Python Flask AI microservice
│   ├── app/
│   │   ├── routes/               # API endpoints
│   │   ├── utils/                # Face detection, alignment, embedding
│   │   └── config.py             # Configuration
│   ├── models/                   # Pre-trained models
│   ├── run.py                    # Flask entry point
│   └── requirements.txt           # Python dependencies
│
├── java-app/                      # Spring Boot main application
│   ├── src/main/java/com/attendance/
│   │   ├── api/                  # REST controllers
│   │   ├── service/              # Business logic
│   │   ├── model/                # Data models
│   │   ├── config/               # Spring config
│   │   └── security/             # Authentication
│   ├── pom.xml                   # Maven configuration
│   └── target/                   # Compiled output
│
├── frontend/                      # Web interface
│   ├── pages/                    # HTML pages
│   │   ├── login.html
│   │   ├── admin-dashboard.html
│   │   ├── student-dashboard.html
│   │   └── ...
│   ├── js/                       # JavaScript logic
│   ├── css/                      # Stylesheets
│   └── index.html                # Main page
│
├── database/                      # Database setup
│   ├── schema.sql                # Table definitions
│   ├── migrations/               # Schema migrations
│   └── seeds/                    # Sample data
│
└── stored_faces/                  # Face embeddings cache
```

---

## Environment Variables (Optional)

Create a `.env` file in `flask-ai/` for custom configuration:

```
FLASK_ENV=development
FLASK_DEBUG=True
AI_SERVICE_PORT=5000
FACE_MIN_SCORE=0.78
```

---

## Performance Tips

1. **GPU Support**: Install `torch` with CUDA support for faster face processing
   ```
   pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
   ```

2. **Model Caching**: Models are cached in `flask-ai/models/` after first run

3. **Database Indexing**: Ensure indexes are applied via `002_add_indexes.sql`

---

## Test Credentials

### For Testing (Use these to test the system)

**Test Admin Account:**
```
Role: Admin
Email: admin@college.edu
Password: Admin@123
```

**Test Faculty Account:**
```
Role: Faculty
Email: faculty@college.edu
Password: Faculty@123
```

**Test Student Account:**
```
Role: Student
Student ID: 1
Roll Number: 21CS001
Password: Student@123
```

### Testing Workflow

1. **Start all services** (Flask, Java, Frontend, MongoDB)
2. **Login as Admin** (Email: `admin@college.edu`, Password: `Admin@123`)
3. **Login as Faculty** (Email: `faculty@college.edu`, Password: `Faculty@123`)
4. **Login as Student** (Student ID: `1`, Password: `Student@123`)
5. Test attendance marking and other features

**Note**: These default credentials are created automatically on application startup. For production, create new users through the Admin Dashboard and generate secure passwords for each student/faculty.

---

## Security Notes

- Change JWT secret in `application.properties`
- Update CORS allowed origins for production
- Use HTTPS in production
- Implement rate limiting for APIs
- Validate all input data

---
## UI of the Project
<img width="998" height="528" alt="image" src="https://github.com/user-attachments/assets/e6bf3b1e-dd34-4b78-b9b0-ed8e50d0aaf9" />
<img width="976" height="480" alt="image" src="https://github.com/user-attachments/assets/ee096846-a96f-4105-9b64-46e991ae0360" />
<img width="1001" height="498" alt="image" src="https://github.com/user-attachments/assets/9d124784-1f87-4dd2-8217-52ba73987c63" />
<img width="975" height="485" alt="image" src="https://github.com/user-attachments/assets/dbaa1672-fff3-4c9e-820d-3c5bebe36bc4" />
<img width="1000" height="499" alt="image" src="https://github.com/user-attachments/assets/7ce90b95-31d8-4827-ab72-3342231b574a" />
<img width="975" height="485" alt="image" src="https://github.com/user-attachments/assets/8e3455c4-6597-48a0-9a07-9d0c0a33e1c5" />
<img width="1001" height="498" alt="image" src="https://github.com/user-attachments/assets/13895cb5-e467-4bf5-9da7-b774e8b48878" />



