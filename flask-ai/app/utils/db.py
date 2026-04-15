import psycopg2
import psycopg2.extras
from app.config import Config


def get_connection():
    """Return a new PostgreSQL connection."""
    return psycopg2.connect(
        host     = Config.DB_HOST,
        port     = Config.DB_PORT,
        dbname   = Config.DB_NAME,
        user     = Config.DB_USER,
        password = Config.DB_PASSWORD
    )


def fetch_all_encodings() -> list[dict]:
    """Fetch all active face encodings from the database."""
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""
                SELECT fe.student_id, fe.encoding_vector
                FROM face_encodings fe
                JOIN students s ON s.student_id = fe.student_id
                WHERE s.is_active = TRUE
            """)
            return [dict(row) for row in cur.fetchall()]
    finally:
        conn.close()


def fetch_student(student_id: int) -> dict | None:
    """Fetch a single student record by ID."""
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""
                SELECT student_id, name, roll_number, department, year
                FROM students WHERE student_id = %s AND is_active = TRUE
            """, (student_id,))
            row = cur.fetchone()
            return dict(row) if row else None
    finally:
        conn.close()


def insert_attendance(student_id, course_id, date, time_in,
                      confidence_score, is_liveness_verified) -> bool:
    """Insert attendance record. Returns False if duplicate."""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO attendance
                    (student_id, course_id, date, time_in,
                     status, confidence_score, is_liveness_verified)
                VALUES (%s, %s, %s, %s, 'present', %s, %s)
                ON CONFLICT ON CONSTRAINT uq_attendance DO NOTHING
            """, (student_id, course_id, date, time_in,
                  confidence_score, is_liveness_verified))
            conn.commit()
            return cur.rowcount > 0
    finally:
        conn.close()