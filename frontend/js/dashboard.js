const apiBaseInput = Utils.$("#apiBase");
apiBaseInput.value = Utils.getApiBase();
const sectionFilterEl = Utils.$("#sectionFilter");
const courseFilterEl = Utils.$("#courseFilter");
const studentsTableBody = Utils.$("#studentsTable tbody");
const studentsTableMeta = Utils.$("#studentsTableMeta");
const attendanceTableBody = Utils.$("#attendanceTable tbody");
const attendanceTableMeta = Utils.$("#attendanceTableMeta");
let cachedStudents = [];
let cachedAllStudents = [];
let cachedTodayAttendance = [];
let cachedCourses = [];
let refreshTimer = null;

const normalizeStudentId = (value) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  return /^\d+$/.test(raw) ? String(Number(raw)) : raw;
};

const loadCourseOptions = async () => {
  const previousValue = courseFilterEl.value || "";
  const coursesRes = await Api.courses();
  const courses = coursesRes.ok && Array.isArray(coursesRes.data) ? coursesRes.data : [];
  cachedCourses = courses;

  courseFilterEl.innerHTML = '<option value="">All Courses</option>';
  courses.forEach((c) => {
    const option = document.createElement("option");
    const value = String(c.id || c.courseCode || "").trim();
    if (!value) return;
    option.value = value;
    const code = c.courseCode ? String(c.courseCode).trim() : value;
    const name = c.courseName ? String(c.courseName).trim() : "";
    option.textContent = name ? `${code} - ${name}` : code;
    courseFilterEl.appendChild(option);
  });

  if (previousValue && [...courseFilterEl.options].some((o) => o.value === previousValue)) {
    courseFilterEl.value = previousValue;
  }
};

const updateStatus = async () => {
  const statusEl = Utils.$("#apiStatus");
  const result = await Api.health();
  if (result.ok) {
    statusEl.textContent = "API: online";
    statusEl.style.background = "#e8f5ef";
    statusEl.style.color = "#2d6a4f";
  } else {
    statusEl.textContent = "API: offline";
    statusEl.style.background = "#ffe3e3";
    statusEl.style.color = "#c92a2a";
  }
};

const updateStats = async () => {
  const selectedSection = (sectionFilterEl.value || "").trim();
  const allStudentsRes = await Api.students();
  const allStudents = allStudentsRes.ok && Array.isArray(allStudentsRes.data) ? allStudentsRes.data : [];
  cachedAllStudents = allStudents;
  const studentsRes = await Api.students(selectedSection || undefined);
  const students = studentsRes.ok && Array.isArray(studentsRes.data) ? studentsRes.data : [];
  cachedStudents = students;
  Utils.$("#statStudents").textContent = String(allStudents.length);

  const sessionActive = localStorage.getItem("attendanceSessionActive") === "true";
  Utils.$("#statSession").textContent = sessionActive ? "Running" : "Stopped";

  const role = localStorage.getItem("role") || "FACULTY";
  Utils.$("#statRole").textContent = role;

  const today = new Date().toISOString().slice(0, 10);
  const courseFilter = (courseFilterEl.value || "").trim();
  const attendanceRes = courseFilter
    ? await Api.attendanceByCourseDate(courseFilter, today)
    : await Api.attendanceByDate(today);
  const todayRows = attendanceRes.ok && Array.isArray(attendanceRes.data) ? attendanceRes.data : [];
  cachedTodayAttendance = todayRows;
  Utils.$("#statToday").textContent = String(todayRows.length);

  if (!selectedSection) {
    const sections = [...new Set(allStudents.map((s) => (s.section || "").trim()).filter(Boolean))].sort();
    sectionFilterEl.innerHTML = '<option value="">All Sections</option>';
    sections.forEach((sec) => {
      const opt = document.createElement("option");
      opt.value = sec;
      opt.textContent = sec;
      sectionFilterEl.appendChild(opt);
    });
  }

  renderStudentsTable();
  renderAttendanceTable();
};

const renderStudentsTable = () => {
  const selectedSection = (sectionFilterEl.value || "").trim().toLowerCase();
  const rows = cachedStudents.filter((s) => !selectedSection || (s.section || "").toLowerCase() === selectedSection);

  studentsTableBody.innerHTML = "";
  rows.forEach((s) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${s.studentId || ""}</td>
      <td>${s.rollNumber || ""}</td>
      <td>${s.name || ""}</td>
      <td>${s.department || ""}</td>
      <td>${s.year || ""}</td>
      <td>${s.section || ""}</td>
    `;
    studentsTableBody.appendChild(tr);
  });

  const sectionLabel = selectedSection ? ` for section ${sectionFilterEl.value}` : "";
  studentsTableMeta.textContent = `${rows.length} student(s) shown${sectionLabel}`;
};

const renderAttendanceTable = () => {
  const selectedSection = (sectionFilterEl.value || "").trim().toLowerCase();
  const courseFilter = (courseFilterEl.value || "").trim();
  const studentsById = new Map(
    cachedAllStudents.map((s) => [normalizeStudentId(s.studentId), s])
  );

  const rows = cachedTodayAttendance
    .map((a) => {
      const student = studentsById.get(normalizeStudentId(a.studentId)) || {};
      return {
        section: student.section || "-",
        rollNumber: student.rollNumber || "-",
        name: student.name || `Student ${a.studentId || "-"}`,
        status: (a.status || "present").toUpperCase(),
        time: a.timeIn || "-",
      };
    })
    .filter((r) => !selectedSection || String(r.section).toLowerCase() === selectedSection)
    .sort((a, b) => String(b.time).localeCompare(String(a.time)));

  attendanceTableBody.innerHTML = "";
  rows.forEach((r) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.section}</td>
      <td>${r.rollNumber}</td>
      <td>${r.name}</td>
      <td>${r.status}</td>
      <td>${r.time}</td>
    `;
    attendanceTableBody.appendChild(tr);
  });

  if (!rows.length) {
    attendanceTableBody.innerHTML = '<tr><td colspan="5">No attendance records for today.</td></tr>';
  }

  const sectionLabel = selectedSection ? ` for section ${sectionFilterEl.value}` : "";
  const courseLabel = courseFilter ? ` for course ${courseFilter}` : "";
  attendanceTableMeta.textContent = `${rows.length} attendance row(s) shown${sectionLabel}${courseLabel}`;
};

Utils.$("#checkHealth").addEventListener("click", async () => {
  Utils.setApiBase(apiBaseInput.value.trim() || "http://127.0.0.1:8080");
  const result = await Api.health();
  const target = Utils.$("#healthResult");
  if (result.ok) {
    target.textContent = `Service online: ${result.data.service}`;
  } else {
    target.textContent = "Service unavailable";
  }
  updateStatus();
  updateStats();
});

Utils.$("#refreshStudents").addEventListener("click", updateStats);
Utils.$("#refreshAttendance").addEventListener("click", updateStats);
sectionFilterEl.addEventListener("change", updateStats);
courseFilterEl.addEventListener("change", updateStats);

updateStatus();
loadCourseOptions().then(updateStats);

if (refreshTimer) clearInterval(refreshTimer);
refreshTimer = setInterval(() => {
  updateStatus();
  loadCourseOptions().then(updateStats);
}, 15000);
