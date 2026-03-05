// You can run this with fiverserver i reccomend it
// THis is just the skeleton of the app, it has no real functionality until we connect the database and firebase auth
// But you can get a good idea of what goes where and what it will look like


// I also added TODO comments throughout the code to indicate where database and auth calls should be made, and what data they should return. This should make it easier to connect everything in sprint 2 without having to rewrite the UI logic.


// Testing
// At this point you can select any role and type in any email in password since database is not added
const AppState = {
    currentUser: null,   
    currentPage: 'login',
    currentView: 'overview',
  };
  
  
  function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById('page-' + pageId);
    if (page) page.classList.add('active');
    AppState.currentPage = pageId;
  }
  
  function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const view = document.getElementById('view-' + viewId);
    if (view) view.classList.add('active');
  
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.view === viewId);
    });
  
    AppState.currentView = viewId;
  }
  
 
  /**
   * Login
   * TODO: Replace body with Firebase signInWithEmailAndPassword()
   *       then fetch user role from MySQL via API
   */
  async function login() {
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-pass').value;
    const role     = document.querySelector('.role-tab.active')?.dataset.role || 'student';
  
    if (!email || !password) {
      showToast('Please fill in all fields.', 'error');
      return;
    }
  
    try {
      // TODO: await firebase.auth().signInWithEmailAndPassword(email, password);
      // TODO: const userRecord = await fetch('/api/users/me').then(r => r.json());
  
      // Placeholder — remove once auth is wired up
      // mainly jsut for testing rn
      AppState.currentUser = { name: email.split('@')[0], email, role };
      updateUserChip();
      showPage('app');
      showView('overview');
    } catch (err) {
      console.error('Login error:', err);
      showToast('Login failed. Check your credentials.', 'error');
    }
  }
  
  /**
   * Register
   * TODO: Replace body with Firebase createUserWithEmailAndPassword()
   *       then POST new user record to /api/users
   */
  async function register() {
    const firstName = document.getElementById('reg-first').value.trim();
    const lastName  = document.getElementById('reg-last').value.trim();
    const wsuId     = document.getElementById('reg-id').value.trim();
    const email     = document.getElementById('reg-email').value.trim();
    const password  = document.getElementById('reg-pass').value;
    const role      = document.getElementById('reg-role').value;
  
    if (!firstName || !lastName || !wsuId || !email || !password) {
      showToast('Please fill in all fields.', 'error');
      return;
    }
  
    try {
      // TODO: const cred = await firebase.auth().createUserWithEmailAndPassword(email, password);
      // TODO: await fetch('/api/users', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ uid: cred.user.uid, firstName, lastName, wsuId, email, role }),
      // });
  
      showToast('Account created! Please sign in.');
      showPage('login');
    } catch (err) {
      console.error('Register error:', err);
      showToast('Registration failed. Try again.', 'error');
    }
  }
  
  /**
   * Logout
   * TODO: Also call firebase.auth().signOut()
   * Will update for sprint 2 (not important yet)
   */
  function logout() {
    AppState.currentUser = null;
    showPage('login');
  }
  
// courses
  /**
   * Load and render all available courses
   * TODO: Replace with GET /api/courses
   * Not important yet
   */
  async function loadCourses() {
    const grid = document.getElementById('course-grid');
    if (!grid) return;
  
    grid.innerHTML = '<p style="color:#9CA3AF;padding:20px">Loading courses...</p>';
  
    try {
      // TODO: const courses = await fetch('/api/courses').then(r => r.json());
      // data base needs to be updated and added here
      const courses = []; // placeholder until database is ready
      renderCourseGrid(courses);
    } catch (err) {
      console.error('Failed to load courses:', err);
      grid.innerHTML = '<p style="color:#ef4444;padding:20px">Failed to load courses.</p>';
    }
  }
  
  function renderCourseGrid(courses) {
    const grid = document.getElementById('course-grid');
    if (!grid) return;
  
    if (!courses.length) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:60px;color:#9CA3AF">
          No courses found. Connect the database to populate this view.
        </div>`;
      return;
    }
  
    grid.innerHTML = courses.map(c => `
      <div class="course-card" onclick="openCourseModal(${c.id})">
        <div class="course-card-stripe stripe-${c.type || 'cs'}"></div>
        <div class="course-card-body">
          <div class="cc-dept">${c.department}</div>
          <div class="cc-title">${c.title}</div>
          <div class="cc-code">${c.code}</div>
          <div class="cc-instructor">${c.instructor}</div>
          <div class="cc-footer">
            <span class="cc-credits">${c.credits} cr.</span>
            <span style="font-size:.76rem;color:#9CA3AF">${c.seats_filled}/${c.seats_total} seats</span>
          </div>
        </div>
      </div>
    `).join('');
  }
  
  /**
   * Open course detail modal
   * TODO: Optionally fetch full course details from GET /api/courses/:id
   */
  function openCourseModal(courseId) {
    const modal = document.getElementById('course-modal');
    const body  = document.getElementById('course-modal-body');
    if (!modal || !body) return;
  
    // TODO: const course = await fetch('/api/courses/' + courseId).then(r => r.json());
    body.innerHTML = `
      <p style="color:#9CA3AF;font-size:.85rem">
        Course ID: ${courseId}<br>
        Details will populate once the database is connected.
      </p>
      <div style="margin-top:20px;display:flex;gap:10px">
        <button class="btn btn-primary" onclick="enrollInCourse(${courseId})">Enroll</button>
        <button class="btn btn-ghost" onclick="closeModal('course-modal')">Close</button>
      </div>`;
  
    modal.classList.add('open');
  }
  
// enrollment
  /**
   * Submit an enrollment request
   * TODO: POST /api/enrollments  { userId, courseId }
   */
  async function enrollInCourse(courseId) {
    try {
      // TODO: await fetch('/api/enrollments', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userId: AppState.currentUser.id, courseId }),
      // });

      // this part is tricky and can be saved for sprint 2
  
      closeModal('course-modal');
      showToast('Enrollment request submitted!');
      loadMyCourses();
    } catch (err) {
      console.error('Enroll error:', err);
      showToast('Enrollment failed. Try again.', 'error');
    }
  }
  
  /**
   * Load courses the current user is enrolled in
   * TODO: GET /api/enrollments?userId=:id
   */
  // sprint 2
  async function loadMyCourses() {
    const list = document.getElementById('my-courses-list');
    if (!list) return;
  
    list.innerHTML = '<p style="color:#9CA3AF;padding:20px">Loading...</p>';
  
    try {
      // TODO: const enrollments = await fetch('/api/enrollments?userId=' + AppState.currentUser.id).then(r => r.json());
      const enrollments = []; // placeholder
  
      if (!enrollments.length) {
        list.innerHTML = `
          <div style="text-align:center;padding:60px;color:#9CA3AF">
            No enrollments yet.<br>
            <a href="#" onclick="showView('courses')" style="color:#1B4F39">Browse courses →</a>
          </div>`;
        return;
      }
  
      list.innerHTML = enrollments.map(e => `
        <div class="mc-card">
          <div class="mc-bar" style="background:#2D7A59"></div>
          <div class="mc-info">
            <div class="mc-title">${e.course_code} — ${e.course_title}</div>
            <div class="mc-meta">${e.instructor} · ${e.schedule}</div>
          </div>
          <div class="mc-right">
            <span class="mc-cr">${e.credits} cr.</span>
            <span class="badge ${statusBadgeClass(e.status)}">${e.status}</span>
          </div>
        </div>
      `).join('');
    } catch (err) {
      console.error('Failed to load enrollments:', err);
      list.innerHTML = '<p style="color:#ef4444;padding:20px">Failed to load enrollments.</p>';
    }
  }
  
  /**
   * Load enrollment requests table (student view)
   * TODO: GET /api/enrollments?userId=:id  (returns status per course)
   */

  // srpint 2
  async function loadEnrollmentStatus() {
    const tbody = document.getElementById('enrollment-tbody');
    if (!tbody) return;
  
    tbody.innerHTML = '<tr><td colspan="5" style="padding:20px;color:#9CA3AF">Loading...</td></tr>';
  
    try {
      // TODO: const data = await fetch('/api/enrollments?userId=' + AppState.currentUser.id).then(r => r.json());
      const data = []; // placeholder
  
      if (!data.length) {
        tbody.innerHTML = '<tr><td colspan="5" style="padding:20px;color:#9CA3AF">No enrollment records found.</td></tr>';
        return;
      }
  
      tbody.innerHTML = data.map(e => `
        <tr>
          <td>${e.course_code} — ${e.course_title}</td>
          <td>${e.credits}</td>
          <td>${e.submitted_at}</td>
          <td>${e.instructor}</td>
          <td><span class="badge ${statusBadgeClass(e.status)}">${e.status}</span></td>
        </tr>
      `).join('');
    } catch (err) {
      console.error('Enrollment status error:', err);
    }
  }
  
// admin stuff
  /**
   * Load pending enrollment requests for admin/instructor review
   * TODO: GET /api/enrollments?status=pending
   */
  async function loadPendingApprovals() {
    const tbody = document.getElementById('approvals-tbody');
    if (!tbody) return;
  
    tbody.innerHTML = '<tr><td colspan="4" style="padding:20px;color:#9CA3AF">Loading...</td></tr>';
  
    try {
      // TODO: const data = await fetch('/api/enrollments?status=pending').then(r => r.json());
      const data = []; // placeholder
  
      if (!data.length) {
        tbody.innerHTML = '<tr><td colspan="4" style="padding:20px;color:#9CA3AF">No pending approvals.</td></tr>';
        return;
      }
  
      tbody.innerHTML = data.map(e => `
        <tr id="approval-${e.id}">
          <td>
            ${e.student_name}
            <br><small style="font-family:monospace;color:#9CA3AF">${e.student_wsu_id}</small>
          </td>
          <td>${e.course_code} — ${e.course_title}</td>
          <td>${e.submitted_at}</td>
          <td>
            <div class="td-actions">
              <button class="btn btn-primary btn-sm" onclick="approveEnrollment(${e.id})">Approve</button>
              <button class="btn btn-danger btn-sm"  onclick="denyEnrollment(${e.id})">Deny</button>
            </div>
          </td>
        </tr>
      `).join('');
    } catch (err) {
      console.error('Failed to load approvals:', err);
    }
  }
  
  /**
   * Approve an enrollment
   * TODO: PATCH /api/enrollments/:id  { status: 'approved' }
   */
  async function approveEnrollment(enrollmentId) {
    try {
      // TODO: await fetch('/api/enrollments/' + enrollmentId, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status: 'approved' }),
      // });
  
      markApprovalRow(enrollmentId, 'approved');
      logActivity('enrollment.approve', 'Approved enrollment #' + enrollmentId);
      showToast('Enrollment approved.');
    } catch (err) {
      console.error('Approve error:', err);
      showToast('Failed to approve. Try again.', 'error');
    }
  }


  // feature placeholder (does nothing really)
  
  /**
   * Deny an enrollment
   * TODO: PATCH /api/enrollments/:id  { status: 'denied' }
   */
  async function denyEnrollment(enrollmentId) {
    try {
      // TODO: await fetch('/api/enrollments/' + enrollmentId, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status: 'denied' }),
      // });
  
      markApprovalRow(enrollmentId, 'denied');
      logActivity('enrollment.deny', 'Denied enrollment #' + enrollmentId);
      showToast('Enrollment denied.');
    } catch (err) {
      console.error('Deny error:', err);
      showToast('Failed to deny. Try again.', 'error');
    }
  }
  
  function markApprovalRow(enrollmentId, status) {
    const row = document.getElementById('approval-' + enrollmentId);
    if (!row) return;
    row.style.opacity = '.45';
    row.style.pointerEvents = 'none';
    const actionsCell = row.querySelector('.td-actions');
    if (actionsCell) {
      actionsCell.innerHTML = `<span class="badge ${statusBadgeClass(status)}">${capitalize(status)}</span>`;
    }
  }
  

  /**
   * Load admin dashboard stats
   * TODO: GET /api/admin/stats
   */
  async function loadAdminStats() {
    try {
      // TODO: const stats = await fetch('/api/admin/stats').then(r => r.json());
      // TODO: document.getElementById('stat-students').textContent    = stats.totalStudents;
      // TODO: document.getElementById('stat-enrollments').textContent = stats.openEnrollments;
      // TODO: document.getElementById('stat-pending').textContent     = stats.pendingApprovals;
      // TODO: document.getElementById('stat-courses').textContent     = stats.totalCourses;
  
      console.log('TODO: load admin stats from /api/admin/stats');
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    }
  }
  
  /**
   * Load activity log table
   * TODO: GET /api/logs  (admin sees all; students see own)
   */
  async function loadLogs() {
    const tbody = document.getElementById('logs-tbody');
    if (!tbody) return;
  
    tbody.innerHTML = '<tr><td colspan="5" style="padding:20px;color:#9CA3AF">Loading...</td></tr>';
  
    try {
      // TODO: const logs = await fetch('/api/logs').then(r => r.json());
      const logs = []; // placeholder
  
      if (!logs.length) {
        tbody.innerHTML = '<tr><td colspan="5" style="padding:20px;color:#9CA3AF">No log entries found.</td></tr>';
        return;
      }
  
      tbody.innerHTML = logs.map(l => `
        <tr>
          <td class="log-ts">${l.created_at}</td>
          <td>${l.user_name}</td>
          <td><span class="badge ${roleBadgeClass(l.role)}">${l.role}</span></td>
          <td><span class="badge badge-blue">${l.event}</span></td>
          <td class="log-detail">${l.detail}</td>
        </tr>
      `).join('');
    } catch (err) {
      console.error('Failed to load logs:', err);
    }
  }
  
  /**
   * Write a log entry
   * TODO: POST /api/logs  { event, detail }
   */
  async function logActivity(event, detail) {
    try {
      // TODO: await fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userId: AppState.currentUser?.id, event, detail }),
      // });
      console.log('[LOG]', event, detail);
    } catch (err) {
      console.error('Failed to write log:', err);
    }
  }

  /**
   * Load overview/dashboard data for the current user
   * TODO: Combine enrolled courses + recent activity into one call
   *       or call GET /api/overview?userId=:id
   */
  async function loadOverview() {
    try {
      // TODO: const data = await fetch('/api/overview?userId=' + AppState.currentUser.id).then(r => r.json());
      // TODO: populate stat cards, enrollment list, and activity feed
      console.log('TODO: load overview data from /api/overview');
    } catch (err) {
      console.error('Failed to load overview:', err);
    }
  }
  
 // these are helper functions
  function updateUserChip() {
    const nameEl   = document.getElementById('sidebar-user-name');
    const roleEl   = document.getElementById('sidebar-user-role');
    const avatarEl = document.getElementById('sidebar-user-avatar');
    if (!AppState.currentUser) return;
    const { name, role } = AppState.currentUser;
    if (nameEl)   nameEl.textContent   = name;
    if (roleEl)   roleEl.textContent   = capitalize(role);
    if (avatarEl) avatarEl.textContent = name.slice(0, 2).toUpperCase();
  }
  
  function toggleSidebar() {
    document.getElementById('sidebar')?.classList.toggle('open');
  }
  
  function closeModal(id) {
    document.getElementById(id)?.classList.remove('open');
  }
  
  let toastTimer;
  function showToast(message, type = 'success') {
    let el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.style.background = type === 'error' ? '#7f1d1d' : '#0F1A13';
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
  }
  
  function statusBadgeClass(status) {
    const map = {
      approved: 'badge-green',
      active:   'badge-green',
      pending:  'badge-amber',
      denied:   'badge-red',
    };
    return map[(status || '').toLowerCase()] || 'badge-blue';
  }
  
  function roleBadgeClass(role) {
    const map = {
      admin:      'badge-red',
      instructor: 'badge-purple',
      student:    'badge-blue',
    };
    return map[(role || '').toLowerCase()] || 'badge-blue';
  }
  
  function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  }
  
 // event listeners to handle UI interactions
 // mostly for navigation and modals, data loading is triggered on nav click as well

  document.addEventListener('DOMContentLoaded', () => {
  
    // Role tabs on login page
    document.querySelectorAll('.role-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
      });
    });
  
    // Filter chips
    document.querySelectorAll('.chips').forEach(group => {
      group.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
          group.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
        });
      });
    });
  
    // Sidebar nav links
    // switch view and load the right data
    document.querySelectorAll('.nav-link[data-view]').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const view = link.dataset.view;
        showView(view);
  
        if (view === 'overview')   loadOverview();
        if (view === 'courses')    loadCourses();
        if (view === 'my-courses') loadMyCourses();
        if (view === 'enrollment') loadEnrollmentStatus();
        if (view === 'admin')      { loadAdminStats(); loadPendingApprovals(); }
        if (view === 'logs')       loadLogs();
  
        // Close sidebar on mobile after navigation
        document.getElementById('sidebar')?.classList.remove('open');
      });
    });
  
    // Close modals when clicking the backdrop
    document.querySelectorAll('.modal-bg').forEach(bg => {
      bg.addEventListener('click', e => {
        if (e.target === bg) bg.classList.remove('open');
      });
    });
  
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', e => {
      const sidebar = document.getElementById('sidebar');
      if (
        sidebar?.classList.contains('open') &&
        !sidebar.contains(e.target) &&
        !e.target.closest('.hamburger')
      ) {
        sidebar.classList.remove('open');
      }
    });
  });