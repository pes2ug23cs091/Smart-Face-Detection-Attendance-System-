const facultyCountEl = Utils.$("#facultyCount");
const studentCountEl = Utils.$("#studentCount");
const courseCountEl = Utils.$("#courseCount");
const todayAttendanceCountEl = Utils.$("#todayAttendanceCount");
const apiStateEl = Utils.$("#apiState");

const facultyTableBody = Utils.$("#facultyTable tbody");
const coursesTableBody = Utils.$("#coursesTable tbody");
const assignmentTableBody = Utils.$("#assignmentTable tbody");

const assignFacultyEl = Utils.$("#assignFaculty");
const assignCourseEl = Utils.$("#assignCourse");
const assignSectionEl = Utils.$("#assignSection");

const statusDateEl = Utils.$("#statusDate");
const statusSectionEl = Utils.$("#statusSection");
const sectionTotalEl = Utils.$("#sectionTotal");
const sectionPresentEl = Utils.$("#sectionPresent");
const sectionAbsentEl = Utils.$("#sectionAbsent");

let cachedFaculty = [];
let cachedStudents = [];
let cachedCourses = [];
let cachedTodayAttendance = [];

const normId = (value) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  return /^\d+$/.test(raw) ? String(Number(raw)) : raw;
};

const loadHealth = async () => {
  const result = await Api.health();
  apiStateEl.textContent = result.ok ? "Online" : "Offline";
};

const loadFaculty = async () => {
  const result = await Api.faculties();
  if (!result.ok || !Array.isArray(result.data)) {
    facultyTableBody.innerHTML = '<tr><td colspan="4">Unable to load faculty.</td></tr>';
    facultyCountEl.textContent = "0";
    assignFacultyEl.innerHTML = "<option value=''>No faculty</option>";
    cachedFaculty = [];
    return;
  }

  cachedFaculty = result.data.filter((f) => (f.role || "FACULTY") === "FACULTY");
  facultyCountEl.textContent = String(cachedFaculty.length);
  facultyTableBody.innerHTML = "";

  cachedFaculty.forEach((f) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${f.name || ""}</td>
      <td>${f.email || ""}</td>
      <td>${f.department || ""}</td>
      <td><button class="button ghost" data-delete-faculty="${f.id || ""}">Delete</button></td>
    `;
    facultyTableBody.appendChild(tr);
  });

  assignFacultyEl.innerHTML = "";
  cachedFaculty.forEach((f) => {
    const option = document.createElement("option");
    option.value = f.id || "";
    option.textContent = `${f.name || "Faculty"} (${f.email || ""})`;
    assignFacultyEl.appendChild(option);
  });
};

const loadStudents = async () => {
  const result = await Api.students();
  if (!result.ok || !Array.isArray(result.data)) {
    studentCountEl.textContent = "0";
    cachedStudents = [];
    return;
  }

  const rows = result.data;
  cachedStudents = rows;
  studentCountEl.textContent = String(rows.length);
};

const loadCourses = async () => {
  const result = await Api.courses();
  if (!result.ok || !Array.isArray(result.data)) {
    coursesTableBody.innerHTML = '<tr><td colspan="4">Unable to load courses.</td></tr>';
    courseCountEl.textContent = "0";
    return;
  }

  const rows = result.data;
  cachedCourses = rows;
  courseCountEl.textContent = String(rows.length);
  coursesTableBody.innerHTML = "";

  rows.forEach((c) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.courseCode || ""}</td>
      <td>${c.courseName || ""}</td>
      <td>${c.section || ""}</td>
      <td><button class="button ghost" data-delete-course="${c.id || ""}">Delete</button></td>
    `;
    coursesTableBody.appendChild(tr);
  });

  assignCourseEl.innerHTML = "";
  rows.forEach((c) => {
    const option = document.createElement("option");
    option.value = c.id || "";
    option.textContent = `${c.courseCode || ""} - ${c.courseName || ""}`;
    assignCourseEl.appendChild(option);
  });

  renderAssignmentTable();
};

const loadTodayAttendance = async () => {
  const today = new Date().toISOString().slice(0, 10);
  const result = await Api.attendanceByDate(today);

  const rows = result.ok && Array.isArray(result.data) ? result.data : [];
  cachedTodayAttendance = rows;
  todayAttendanceCountEl.textContent = String(rows.length);
};

const renderAssignmentTable = () => {
  const facultyById = new Map(cachedFaculty.map((f) => [String(f.id || ""), f]));
  assignmentTableBody.innerHTML = "";

  cachedCourses.forEach((c) => {
    const faculty = facultyById.get(String(c.facultyId || ""));
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.courseCode || ""} - ${c.courseName || ""}</td>
      <td>${c.section || ""}</td>
      <td>${faculty ? faculty.name : "Not Assigned"}</td>
    `;
    assignmentTableBody.appendChild(tr);
  });

  if (!cachedCourses.length) {
    assignmentTableBody.innerHTML = '<tr><td colspan="3">No courses found.</td></tr>';
  }
};

const refreshSectionOptions = () => {
  const sections = [...new Set(cachedStudents.map((s) => String(s.section || "").trim()).filter(Boolean))].sort();
  statusSectionEl.innerHTML = "";
  sections.forEach((sec) => {
    const option = document.createElement("option");
    option.value = sec;
    option.textContent = sec;
    statusSectionEl.appendChild(option);
  });
};

const loadSectionStatus = async () => {
  const date = statusDateEl.value || new Date().toISOString().slice(0, 10);
  const section = statusSectionEl.value;

  if (!section) {
    sectionTotalEl.textContent = "0";
    sectionPresentEl.textContent = "0";
    sectionAbsentEl.textContent = "0";
    return;
  }

  const studentsInSection = cachedStudents.filter((s) => String(s.section || "").trim() === section);
  const sectionStudentIds = new Set(studentsInSection.map((s) => normId(s.studentId)));

  const attendanceRes = await Api.attendanceByDate(date);
  const attendanceRows = attendanceRes.ok && Array.isArray(attendanceRes.data) ? attendanceRes.data : [];

  const presentIds = new Set(
    attendanceRows
      .filter((a) => sectionStudentIds.has(normId(a.studentId)))
      .map((a) => normId(a.studentId))
  );

  const total = studentsInSection.length;
  const present = presentIds.size;
  const absent = Math.max(total - present, 0);

  sectionTotalEl.textContent = String(total);
  sectionPresentEl.textContent = String(present);
  sectionAbsentEl.textContent = String(absent);
};

const refreshAll = async () => {
  await loadHealth();
  await Promise.all([loadFaculty(), loadStudents(), loadCourses(), loadTodayAttendance()]);
  refreshSectionOptions();
  await loadSectionStatus();
};

Utils.$("#facultyForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    name: Utils.$("#facultyName").value.trim(),
    email: Utils.$("#facultyEmail").value.trim(),
    department: Utils.$("#facultyDept").value.trim(),
    password: Utils.$("#facultyPassword").value.trim(),
    active: true,
  };

  if (!payload.name || !payload.email || !payload.department) {
    Utils.toast("Faculty name, email and department are required", "error");
    return;
  }

  const result = await Api.createFaculty(payload);
  if (!result.ok) {
    Utils.toast("Unable to create faculty", "error");
    return;
  }

  Utils.toast("Faculty added", "success");
  Utils.$("#facultyForm").reset();
  Utils.$("#facultyPassword").value = "Faculty@123";
  await loadFaculty();
  renderAssignmentTable();
});

Utils.$("#courseForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    courseCode: Utils.$("#courseCode").value.trim(),
    courseName: Utils.$("#courseName").value.trim(),
    section: Utils.$("#courseSection").value.trim(),
    active: true,
  };

  if (!payload.courseCode || !payload.courseName || !payload.section) {
    Utils.toast("Course Code, Name and Section are required", "error");
    return;
  }

  const result = await Api.createCourse(payload);
  if (!result.ok) {
    Utils.toast("Unable to create course", "error");
    return;
  }

  Utils.toast("Course added", "success");
  Utils.$("#courseForm").reset();
  await loadCourses();
  renderAssignmentTable();
});

Utils.$("#assignmentForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const facultyId = assignFacultyEl.value;
  const courseId = assignCourseEl.value;
  const section = assignSectionEl.value.trim();

  if (!facultyId || !courseId || !section) {
    Utils.toast("Select faculty, course and section", "error");
    return;
  }

  const targetCourse = cachedCourses.find((c) => String(c.id || "") === String(courseId));
  if (!targetCourse) {
    Utils.toast("Course not found", "error");
    return;
  }

  const payload = {
    ...targetCourse,
    facultyId,
    section,
  };

  const result = await Api.updateCourse(courseId, payload);
  if (!result.ok) {
    Utils.toast("Unable to assign faculty", "error");
    return;
  }

  Utils.toast("Faculty assigned successfully", "success");
  await loadCourses();
  renderAssignmentTable();
});

facultyTableBody.addEventListener("click", async (e) => {
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;

  const id = target.getAttribute("data-delete-faculty");
  if (!id) return;

  const result = await Api.deleteFaculty(id);
  if (!result.ok) {
    Utils.toast("Unable to delete faculty", "error");
    return;
  }

  Utils.toast("Faculty deleted", "success");
  await loadFaculty();
  renderAssignmentTable();
});

coursesTableBody.addEventListener("click", async (e) => {
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;

  const id = target.getAttribute("data-delete-course");
  if (!id) return;

  const result = await Api.deleteCourse(id);
  if (!result.ok) {
    Utils.toast("Unable to delete course", "error");
    return;
  }

  Utils.toast("Course deleted", "success");
  await loadCourses();
});

Utils.$("#refreshCourses").addEventListener("click", loadCourses);
Utils.$("#loadStatus").addEventListener("click", loadSectionStatus);
statusSectionEl.addEventListener("change", loadSectionStatus);
statusDateEl.addEventListener("change", loadSectionStatus);

Utils.$("#checkHealth").addEventListener("click", async () => {
  await refreshAll();
});

statusDateEl.value = new Date().toISOString().slice(0, 10);
refreshAll();
