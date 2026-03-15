SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM activity_logs;
DELETE FROM enrollments;
DELETE FROM courses;
DELETE FROM grades;
DELETE FROM students;
DELETE FROM instructors;
DELETE FROM users;

SET FOREIGN_KEY_CHECKS = 1;

-- users
INSERT INTO users (email, password, user_type, first_name, last_name, is_active)
VALUES
('admin@wsu.edu',      'dev', 'administrator', 'Admin',  'User',  'Y'),
('instructor@wsu.edu', 'dev', 'instructor',    'Ivy',    'Teach', 'Y'),
('student@wsu.edu',    'dev', 'student',       'Sam',    'Coug',  'Y'),
('student2@wsu.edu',   'dev', 'student',       'Alex',   'Brown', 'Y'),
('student3@wsu.edu',   'dev', 'student',       'Taylor', 'Green', 'Y');

-- instructors
INSERT INTO instructors (user_id, department, office_location, office_hours)
SELECT user_id, 'Computer Science', 'Dana 101', 'Mon/Wed 2-3pm'
FROM users
WHERE email = 'instructor@wsu.edu';

-- students
INSERT INTO students (user_id, student_number, major, graduation_year)
SELECT user_id, '01XXXXXXX', 'CS + Bio', 2027
FROM users
WHERE email = 'student@wsu.edu';

INSERT INTO students (user_id, student_number, major, graduation_year)
SELECT user_id, '01YYYYYYY', 'Computer Science', 2028
FROM users
WHERE email = 'student2@wsu.edu';

INSERT INTO students (user_id, student_number, major, graduation_year)
SELECT user_id, '01ZZZZZZZ', 'Biology', 2027
FROM users
WHERE email = 'student3@wsu.edu';

-- grades
INSERT INTO grades (grade_value, grade_description, grade_points)
VALUES
('NA', 'Not assigned', NULL),
('A',  'Excellent', 4.0),
('B',  'Good', 3.0),
('C',  'Satisfactory', 2.0);

-- courses
INSERT INTO courses (
  course_code, title, description, instructor_id,
  max_capacity, current_count, status, semester, credits
)
SELECT 'CPT_S 451', 'Database Systems', 'SQL + DB design', instructor_id,
       60, 1, 'active', 'Spring', 3
FROM instructors
WHERE user_id = (SELECT user_id FROM users WHERE email = 'instructor@wsu.edu')
LIMIT 1;

INSERT INTO courses (
  course_code, title, description, instructor_id,
  max_capacity, current_count, status, semester, credits
)
SELECT 'CPT_S 322', 'Software Engineering I', 'Software design and team development', instructor_id,
       40, 1, 'active', 'Spring', 3
FROM instructors
WHERE user_id = (SELECT user_id FROM users WHERE email = 'instructor@wsu.edu')
LIMIT 1;

INSERT INTO courses (
  course_code, title, description, instructor_id,
  max_capacity, current_count, status, semester, credits
)
SELECT 'CPT_S 315', 'Data Structures', 'Core data structures and algorithms', instructor_id,
       45, 1, 'active', 'Spring', 4
FROM instructors
WHERE user_id = (SELECT user_id FROM users WHERE email = 'instructor@wsu.edu')
LIMIT 1;

-- enrollments
INSERT INTO enrollments (student_id, course_id, status, grade_id, approved_by_admin_id, approval_date)
SELECT s.student_id, c.course_id, 'pending', g.grade_id, NULL, NULL
FROM students s
JOIN users u ON u.user_id = s.user_id
JOIN courses c ON c.course_code = 'CPT_S 451'
JOIN grades g ON g.grade_value = 'NA'
WHERE u.email = 'student@wsu.edu'
LIMIT 1;

INSERT INTO enrollments (student_id, course_id, status, grade_id, approved_by_admin_id, approval_date)
SELECT s.student_id, c.course_id, 'approved', g.grade_id, a.user_id, CURDATE()
FROM students s
JOIN users u ON u.user_id = s.user_id
JOIN courses c ON c.course_code = 'CPT_S 322'
JOIN grades g ON g.grade_value = 'NA'
JOIN users a ON a.email = 'admin@wsu.edu'
WHERE u.email = 'student2@wsu.edu'
LIMIT 1;

INSERT INTO enrollments (student_id, course_id, status, grade_id, approved_by_admin_id, approval_date)
SELECT s.student_id, c.course_id, 'approved', g.grade_id, a.user_id, CURDATE()
FROM students s
JOIN users u ON u.user_id = s.user_id
JOIN courses c ON c.course_code = 'CPT_S 315'
JOIN grades g ON g.grade_value = 'NA'
JOIN users a ON a.email = 'admin@wsu.edu'
WHERE u.email = 'student3@wsu.edu'
LIMIT 1;

-- activity logs
INSERT INTO activity_logs (user_id, activity_type, description)
SELECT user_id, 'seed', 'Seed data inserted'
FROM users
WHERE email = 'admin@wsu.edu';

INSERT INTO activity_logs (user_id, activity_type, description)
SELECT user_id, 'auth.login', 'Seeded sample login activity'
FROM users
WHERE email = 'student@wsu.edu';

INSERT INTO activity_logs (user_id, activity_type, description)
SELECT user_id, 'enrollment.pending', 'Submitted enrollment request for CPT_S 451'
FROM users
WHERE email = 'student@wsu.edu';