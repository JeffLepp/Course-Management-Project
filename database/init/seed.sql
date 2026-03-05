-- Feel free to change any seeded data as you want!
-- users
INSERT INTO users (email, password, user_type, first_name, last_name, is_active)
VALUES
('admin@wsu.edu','dev','administrator','Admin','User','Y'),
('instructor@wsu.edu','dev','instructor','Ivy','Teach','Y'),
('student@wsu.edu','dev','student','Sam','Coug','Y');

-- instructors (ties to users.user_id)
INSERT INTO instructors (user_id, department, office_location, office_hours)
SELECT user_id, 'Computer Science', 'Dana 101', 'Mon/Wed 2-3pm'
FROM users WHERE email='instructor@wsu.edu';

-- students (ties to users.user_id)
INSERT INTO students (user_id, student_number, major, graduation_year)
SELECT user_id, '01XXXXXXX', 'CS + Bio', 2027
FROM users WHERE email='student@wsu.edu';

-- grades (if you use grade_id later)
INSERT INTO grades (grade_value, grade_description, grade_points)
VALUES ('NA','Not assigned',NULL);

-- courses (ties to instructors.instructor_id)
INSERT INTO courses (course_code, title, description, instructor_id, max_capacity, current_count, status, semester, credits)
SELECT 'CPT_S 451', 'Database Systems', 'SQL + DB design', instructor_id, 60, 0, 'active', 'Spring', 3
FROM instructors
LIMIT 1;

-- enrollments (ties to students.student_id and courses.course_id)
INSERT INTO enrollments (student_id, course_id, status)
SELECT s.student_id, c.course_id, 'pending'
FROM students s
JOIN courses c ON c.course_code='CPT_S 451'
LIMIT 1;

-- activity log (ties to users.user_id)
INSERT INTO activity_logs (user_id, activity_type, description)
SELECT user_id, 'seed', 'Seed data inserted'
FROM users WHERE email='admin@wsu.edu';