-- ============================================================
--  Seed data — for local dev and testing only
-- ============================================================

-- Admin faculty account  (password: Admin@1234  — bcrypt hashed)
INSERT INTO faculty (name, email, password_hash, department, role)
VALUES (
    'Admin User',
    'admin@college.edu',
    '$2a$12$placeholderHashReplaceWithRealBcryptHash',
    'Computer Science',
    'admin'
) ON CONFLICT (email) DO NOTHING;

-- Sample faculty
INSERT INTO faculty (name, email, password_hash, department, role)
VALUES (
    'Dr. Priya Sharma',
    'priya.sharma@college.edu',
    '$2a$12$placeholderHashReplaceWithRealBcryptHash',
    'Computer Science',
    'faculty'
) ON CONFLICT (email) DO NOTHING;

-- Sample courses
INSERT INTO courses (course_name, course_code, faculty_id, department, semester)
VALUES
    ('Data Structures',          'CS301', 1, 'Computer Science', 3),
    ('Operating Systems',        'CS401', 1, 'Computer Science', 4),
    ('Machine Learning',         'CS501', 2, 'Computer Science', 5)
ON CONFLICT (course_code) DO NOTHING;

-- Sample students
INSERT INTO students (name, roll_number, email, department, year)
VALUES
    ('Arjun Mehta',     '21CS001', 'arjun@college.edu',    'Computer Science', 3),
    ('Sneha Patel',     '21CS002', 'sneha@college.edu',    'Computer Science', 3),
    ('Rahul Verma',     '21CS003', 'rahul@college.edu',    'Computer Science', 3),
    ('Aisha Khan',      '21CS004', 'aisha@college.edu',    'Computer Science', 3),
    ('Dev Nair',        '21CS005', 'dev@college.edu',      'Computer Science', 3)
ON CONFLICT (roll_number) DO NOTHING;