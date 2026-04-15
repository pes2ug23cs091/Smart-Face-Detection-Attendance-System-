-- ============================================================
--  Migration 002 — indexes for query performance
-- ============================================================

-- attendance lookups by student and date are the hottest queries
CREATE INDEX IF NOT EXISTS idx_attendance_student  ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_course   ON attendance(course_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date     ON attendance(date);

-- combined index for "attendance report for course X on date Y"
CREATE INDEX IF NOT EXISTS idx_attendance_course_date
    ON attendance(course_id, date);

-- face encoding lookups by student (recognition pipeline)
CREATE INDEX IF NOT EXISTS idx_face_enc_student    ON face_encodings(student_id);

-- student search by roll number and department
CREATE INDEX IF NOT EXISTS idx_student_roll        ON students(roll_number);
CREATE INDEX IF NOT EXISTS idx_student_dept        ON students(department);

-- faculty login lookup
CREATE INDEX IF NOT EXISTS idx_faculty_email       ON faculty(email);

-- audit log by faculty and time
CREATE INDEX IF NOT EXISTS idx_audit_faculty       ON audit_log(faculty_id);
CREATE INDEX IF NOT EXISTS idx_audit_time          ON audit_log(performed_at DESC);