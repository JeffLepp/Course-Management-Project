import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json());

function mapUser(row) {
  return {
    id: row.user_id,
    email: row.email,
    role: row.role,
    created_at: row.created_at,
    is_active: row.is_active,
  };
}

function mapCourse(row) {
  return {
    id: row.course_id,
    code: row.course_code,
    title: row.title,
    description: row.description,
    instructor_id: row.instructor_id,
    instructor: row.instructor_name || 'TBA',
    start_date: row.start_date,
    end_date: row.end_date,
    max_capacity: row.max_capacity,
    current_count: row.current_count,
    status: row.status,
    semester: row.semester,
    credits: row.credits,
    seats_total: row.max_capacity,
    seats_filled: row.current_count,
    department: row.course_code?.split?.(' ')[0] || row.course_code,
    type: 'cs',
  };
}

function mapEnrollment(row) {
  return {
    id: row.enrollment_id,
    user_id: row.user_id,
    course_id: row.course_id,
    enrollment_date: row.enrollment_date,
    submitted_at: row.enrollment_date,
    status: row.status,
    grade: row.grade,
    approved_by: row.approve_by,
    approval_date: row.approval_date,
    course_code: row.course_code,
    course_title: row.course_title,
    instructor: row.instructor_name,
    credits: row.credits,
    schedule: buildSchedule(row.start_date, row.end_date, row.semester),
    student_name: row.student_name,
    student_wsu_id: row.student_wsu_id || null,
  };
}

function buildSchedule(startDate, endDate, semester) {
  const parts = [];
  if (semester) parts.push(semester);
  if (startDate && endDate) parts.push(`${formatDate(startDate)} - ${formatDate(endDate)}`);
  return parts.join(' · ') || 'Schedule TBD';
}

function formatDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toISOString().slice(0, 10);
}

async function writeLog(userId, activityType, description, ipAddress = null) {
  if (!userId) return;
  await pool.execute(
    `INSERT INTO activity_logs (user_id, activity_type, description, ip_address)
     VALUES (?, ?, ?, ?)`,
    [userId, activityType, description, ipAddress]
  );
}

app.get('/api/health', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({ ok: true, db: rows[0]?.ok === 1 });
  } catch (error) {
    res.status(500).json({ ok: false, message: 'Database connection failed' });
  }
});

// Simple placeholder login to match current frontend shape.
// For now this checks email + password in MySQL.
app.post('/api/auth/login', async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const [rows] = await pool.execute(
    `SELECT user_id, email, password, role, created_at, is_active
     FROM users
     WHERE email = ?`,
    [email]
  );

  const user = rows[0];
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  if (user.is_active !== 'Y') {
    return res.status(403).json({ message: 'Account is inactive.' });
  }

  if (role && role !== user.role) {
    return res.status(403).json({ message: 'Selected role does not match account role.' });
  }

  await writeLog(user.user_id, 'auth.login', `User ${email} logged in.`, req.ip);
  res.json({ user: mapUser(user) });
});

app.post('/api/users', async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: 'email, password, and role are required.' });
  }

  if (!['student', 'instructor', 'administrator'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role.' });
  }

  const [result] = await pool.execute(
    `INSERT INTO users (email, password, role, is_active)
     VALUES (?, ?, ?, 'Y')`,
    [email, password, role]
  );

  const [rows] = await pool.execute(
    `SELECT user_id, email, role, created_at, is_active
     FROM users WHERE user_id = ?`,
    [result.insertId]
  );

  await writeLog(result.insertId, 'user.register', `Created account for ${email}.`, req.ip);
  res.status(201).json(mapUser(rows[0]));
});

app.get('/api/users/:id', async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT user_id, email, role, created_at, is_active
     FROM users WHERE user_id = ?`,
    [req.params.id]
  );

  if (!rows.length) return res.status(404).json({ message: 'User not found.' });
  res.json(mapUser(rows[0]));
});

app.get('/api/courses', async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT c.course_id, c.course_code, c.title, c.description, c.instructor_id,
            c.start_date, c.end_date, c.max_capacity, c.current_count,
            c.status, c.semester, c.credits,
            u.email AS instructor_name
     FROM courses c
     LEFT JOIN users u ON u.user_id = c.instructor_id
     ORDER BY c.course_code ASC`
  );

  res.json(rows.map(mapCourse));
});

app.get('/api/courses/:id', async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT c.course_id, c.course_code, c.title, c.description, c.instructor_id,
            c.start_date, c.end_date, c.max_capacity, c.current_count,
            c.status, c.semester, c.credits,
            u.email AS instructor_name
     FROM courses c
     LEFT JOIN users u ON u.user_id = c.instructor_id
     WHERE c.course_id = ?`,
    [req.params.id]
  );

  if (!rows.length) return res.status(404).json({ message: 'Course not found.' });
  res.json(mapCourse(rows[0]));
});

app.post('/api/enrollments', async (req, res) => {
  const { userId, courseId } = req.body;
  if (!userId || !courseId) {
    return res.status(400).json({ message: 'userId and courseId are required.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [courseRows] = await conn.execute(
      `SELECT course_id, title, max_capacity, current_count, status
       FROM courses WHERE course_id = ? FOR UPDATE`,
      [courseId]
    );

    if (!courseRows.length) {
      await conn.rollback();
      return res.status(404).json({ message: 'Course not found.' });
    }

    const course = courseRows[0];
    if (course.status === 'cancelled' || course.status === 'completed') {
      await conn.rollback();
      return res.status(400).json({ message: 'Course is not open for enrollment.' });
    }

    const [existingRows] = await conn.execute(
      `SELECT enrollment_id, status
       FROM enrollments
       WHERE user_id = ? AND course_id = ? AND status IN ('pending', 'approved')`,
      [userId, courseId]
    );

    if (existingRows.length) {
      await conn.rollback();
      return res.status(409).json({ message: 'Enrollment already exists.' });
    }

    if (course.current_count >= course.max_capacity) {
      await conn.rollback();
      return res.status(409).json({ message: 'Course is full.' });
    }

    const [result] = await conn.execute(
      `INSERT INTO enrollments (user_id, course_id, status, grade)
       VALUES (?, ?, 'pending', 'NA')`,
      [userId, courseId]
    );

    await conn.execute(
      `INSERT INTO activity_logs (user_id, activity_type, description, ip_address)
       VALUES (?, 'enrollment.request', ?, ?)`,
      [userId, `Requested enrollment for course #${courseId}.`, req.ip]
    );

    await conn.commit();
    res.status(201).json({
      id: result.insertId,
      message: 'Enrollment request submitted.'
    });
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
});

app.get('/api/enrollments', async (req, res) => {
  const { userId, status } = req.query;

  let sql = `SELECT e.enrollment_id, e.user_id, e.course_id, e.enrollment_date, e.status,
                    e.grade, e.approve_by, e.approval_date,
                    c.course_code, c.title AS course_title, c.credits,
                    c.start_date, c.end_date, c.semester,
                    student.email AS student_name,
                    approver.email AS approver_name,
                    instructor.email AS instructor_name
             FROM enrollments e
             JOIN courses c ON c.course_id = e.course_id
             JOIN users student ON student.user_id = e.user_id
             LEFT JOIN users approver ON approver.user_id = e.approve_by
             LEFT JOIN users instructor ON instructor.user_id = c.instructor_id
             WHERE 1=1`;
  const params = [];

  if (userId) {
    sql += ' AND e.user_id = ?';
    params.push(userId);
  }
  if (status) {
    sql += ' AND e.status = ?';
    params.push(status);
  }

  sql += ' ORDER BY e.enrollment_date DESC, e.enrollment_id DESC';

  const [rows] = await pool.execute(sql, params);
  res.json(rows.map(mapEnrollment));
});

app.patch('/api/enrollments/:id', async (req, res) => {
  const { status, approverId } = req.body;
  const enrollmentId = req.params.id;

  if (!['approved', 'denied', 'withdrawn'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status update.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.execute(
      `SELECT e.enrollment_id, e.user_id, e.course_id, e.status, c.current_count, c.max_capacity
       FROM enrollments e
       JOIN courses c ON c.course_id = e.course_id
       WHERE e.enrollment_id = ? FOR UPDATE`,
      [enrollmentId]
    );

    if (!rows.length) {
      await conn.rollback();
      return res.status(404).json({ message: 'Enrollment not found.' });
    }

    const enrollment = rows[0];
    if (enrollment.status !== 'pending') {
      await conn.rollback();
      return res.status(409).json({ message: 'Only pending enrollments can be updated.' });
    }

    if (status === 'approved' && enrollment.current_count >= enrollment.max_capacity) {
      await conn.rollback();
      return res.status(409).json({ message: 'Course is full.' });
    }

    await conn.execute(
      `UPDATE enrollments
       SET status = ?, approve_by = ?, approval_date = CURRENT_DATE
       WHERE enrollment_id = ?`,
      [status, approverId || null, enrollmentId]
    );

    if (status === 'approved') {
      await conn.execute(
        `UPDATE courses
         SET current_count = current_count + 1
         WHERE course_id = ?`,
        [enrollment.course_id]
      );
    }

    await conn.execute(
      `INSERT INTO activity_logs (user_id, activity_type, description, ip_address)
       VALUES (?, ?, ?, ?)`,
      [approverId || enrollment.user_id, `enrollment.${status}`, `${status} enrollment #${enrollmentId}.`, req.ip]
    );

    await conn.commit();
    res.json({ message: `Enrollment ${status}.` });
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
});

app.get('/api/admin/stats', async (_req, res) => {
  const [[students]] = await pool.query(`SELECT COUNT(*) AS totalStudents FROM users WHERE role = 'student' AND is_active = 'Y'`);
  const [[courses]] = await pool.query(`SELECT COUNT(*) AS totalCourses FROM courses`);
  const [[pending]] = await pool.query(`SELECT COUNT(*) AS pendingApprovals FROM enrollments WHERE status = 'pending'`);
  const [[enrollments]] = await pool.query(`SELECT COUNT(*) AS openEnrollments FROM enrollments WHERE status IN ('pending', 'approved')`);

  res.json({
    totalStudents: students.totalStudents,
    totalCourses: courses.totalCourses,
    pendingApprovals: pending.pendingApprovals,
    openEnrollments: enrollments.openEnrollments,
  });
});

app.get('/api/logs', async (req, res) => {
  const { userId } = req.query;

  let sql = `SELECT l.log_id, l.created_at, l.activity_type AS event, l.description AS detail,
                    u.email AS user_name, u.role
             FROM activity_logs l
             JOIN users u ON u.user_id = l.user_id`;
  const params = [];

  if (userId) {
    sql += ' WHERE l.user_id = ?';
    params.push(userId);
  }

  sql += ' ORDER BY l.created_at DESC, l.log_id DESC';

  const [rows] = await pool.execute(sql, params);
  res.json(rows);
});

app.post('/api/logs', async (req, res) => {
  const { userId, event, detail } = req.body;
  if (!userId || !event || !detail) {
    return res.status(400).json({ message: 'userId, event, and detail are required.' });
  }

  await writeLog(userId, event, detail, req.ip);
  res.status(201).json({ message: 'Log created.' });
});

app.get('/api/overview', async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ message: 'userId is required.' });
  }

  const [[counts]] = await pool.execute(
    `SELECT
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS enrolled,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'approved' THEN c.credits ELSE 0 END) AS credits
     FROM enrollments e
     JOIN courses c ON c.course_id = e.course_id
     WHERE e.user_id = ?`,
    [userId]
  );

  const [activity] = await pool.execute(
    `SELECT created_at, activity_type, description
     FROM activity_logs
     WHERE user_id = ?
     ORDER BY created_at DESC, log_id DESC
     LIMIT 5`,
    [userId]
  );

  res.json({
    enrolled: Number(counts.enrolled || 0),
    pending: Number(counts.pending || 0),
    credits: Number(counts.credits || 0),
    completed: 0,
    activity,
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`CourseFlow backend running on http://localhost:${PORT}`);
});

