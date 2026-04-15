-- ============================================================
--  Smart Face Recognition Attendance System
--  Migration 001 — create all tables
-- ============================================================

-- Enable pgcrypto for password hashing support (used by Java layer)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------
--  faculty
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS faculty (
    faculty_id      SERIAL PRIMARY KEY,
    name            VARCHAR(100)  NOT NULL,
    email           VARCHAR(150)  NOT NULL UNIQUE,
    password_hash   TEXT          NOT NULL,
    department      VARCHAR(100),
    role            VARCHAR(20)   NOT NULL DEFAULT 'faculty'
                    CHECK (role IN ('faculty', 'admin')),
    is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
--  courses
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS courses (
    course_id       SERIAL PRIMARY KEY,
    course_name     VARCHAR(150)  NOT NULL,
    course_code     VARCHAR(20)   NOT NULL UNIQUE,
    faculty_id      INT           REFERENCES faculty(faculty_id) ON DELETE SET NULL,
    department      VARCHAR(100),
    semester        INT           CHECK (semester BETWEEN 1 AND 8),
    is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
--  students
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS students (
    student_id          SERIAL PRIMARY KEY,
    name                VARCHAR(100)  NOT NULL,
    roll_number         VARCHAR(20)   NOT NULL UNIQUE,
    email               VARCHAR(150)  UNIQUE,
    department          VARCHAR(100),
    year                INT           CHECK (year BETWEEN 1 AND 4),
    face_encoding_path  TEXT,                        -- optional file ref
    registered_at       TIMESTAMP     NOT NULL DEFAULT NOW(),
    is_active           BOOLEAN       NOT NULL DEFAULT TRUE
);

-- ------------------------------------------------------------
--  face_encodings  (one student → many encodings / model versions)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS face_encodings (
    encoding_id     SERIAL PRIMARY KEY,
    student_id      INT           NOT NULL
                    REFERENCES students(student_id) ON DELETE CASCADE,
    encoding_vector TEXT          NOT NULL,           -- JSON array string from FaceNet
    model_used      VARCHAR(50)   NOT NULL DEFAULT 'facenet',
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
--  attendance
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance (
    attendance_id           SERIAL PRIMARY KEY,
    student_id              INT       NOT NULL
                            REFERENCES students(student_id) ON DELETE CASCADE,
    course_id               INT       NOT NULL
                            REFERENCES courses(course_id)  ON DELETE CASCADE,
    date                    DATE      NOT NULL,
    time_in                 TIME      NOT NULL,
    status                  VARCHAR(10) NOT NULL DEFAULT 'present'
                            CHECK (status IN ('present', 'absent', 'late')),
    confidence_score        FLOAT     CHECK (confidence_score BETWEEN 0.0 AND 1.0),
    is_liveness_verified    BOOLEAN   NOT NULL DEFAULT FALSE,
    marked_at               TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Prevent duplicate attendance for same student + course + date
    CONSTRAINT uq_attendance UNIQUE (student_id, course_id, date)
);

-- ------------------------------------------------------------
--  audit_log  (every faculty action is recorded)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_log (
    log_id          SERIAL PRIMARY KEY,
    faculty_id      INT           REFERENCES faculty(faculty_id) ON DELETE SET NULL,
    action          VARCHAR(100)  NOT NULL,   -- e.g. 'REGISTER_STUDENT', 'START_SESSION'
    details         TEXT,                     -- JSON payload for context
    performed_at    TIMESTAMP     NOT NULL DEFAULT NOW()
);