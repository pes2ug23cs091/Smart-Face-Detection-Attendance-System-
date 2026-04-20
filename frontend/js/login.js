const tabFaculty = Utils.$("#tabFaculty");
const tabStudent = Utils.$("#tabStudent");
const tabAdmin = Utils.$("#tabAdmin");
const facultyForm = Utils.$("#facultyForm");
const studentForm = Utils.$("#studentForm");
const adminForm = Utils.$("#adminForm");

const switchRole = (role) => {
  const isFaculty = role === "faculty";
  const isStudent = role === "student";
  const isAdmin = role === "admin";

  tabFaculty.classList.toggle("active", isFaculty);
  tabStudent.classList.toggle("active", isStudent);
  tabAdmin.classList.toggle("active", isAdmin);

  facultyForm.classList.toggle("active", isFaculty);
  studentForm.classList.toggle("active", isStudent);
  adminForm.classList.toggle("active", isAdmin);
};

tabFaculty.addEventListener("click", () => switchRole("faculty"));
tabStudent.addEventListener("click", () => switchRole("student"));
tabAdmin.addEventListener("click", () => switchRole("admin"));

facultyForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const result = await Api.facultyLogin({
    email: Utils.$("#email").value.trim(),
    password: Utils.$("#password").value,
  });

  if (!result.ok) {
    Utils.toast("Invalid faculty credentials", "error");
    return;
  }

  localStorage.setItem("token", result.data.token);
  localStorage.setItem("role", result.data.role);
  localStorage.setItem("facultyUser", result.data.name || "faculty");
  Utils.toast("Faculty login successful", "success");
  setTimeout(() => {
    window.location.href = "dashboard.html";
  }, 250);
});

studentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const result = await Api.studentLogin({
    studentIdOrRoll: Utils.$("#studentId").value.trim(),
    password: Utils.$("#studentPass").value,
  });

  if (!result.ok) {
    Utils.toast("Invalid student credentials", "error");
    return;
  }

  localStorage.setItem("token", result.data.token);
  localStorage.setItem("role", result.data.role);
  localStorage.setItem("studentUser", result.data.name || result.data.userId || "student");
  Utils.toast("Student login successful", "success");
  setTimeout(() => {
    window.location.href = "student-dashboard.html";
  }, 250);
});

adminForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = Utils.$("#adminEmail").value.trim();
  const password = Utils.$("#adminPass").value;

  const result = await Api.facultyLogin({ email, password });
  if (!result.ok) {
    Utils.toast("Invalid admin credentials", "error");
    return;
  }

  if (email.toLowerCase() !== "admin@college.edu") {
    Utils.toast("Use admin account for admin login", "error");
    return;
  }

  localStorage.setItem("token", result.data.token);
  localStorage.setItem("role", "ADMIN");
  localStorage.setItem("adminUser", result.data.name || "admin");
  Utils.toast("Admin login successful", "success");
  setTimeout(() => {
    window.location.href = "admin-dashboard.html";
  }, 250);
});

Utils.$("#checkHealth").addEventListener("click", async () => {
  const result = await Api.health();
  const target = Utils.$("#healthResult");
  target.textContent = result.ok ? `Service online: ${result.data.service}` : "Service unavailable";
});

const backToHomeEl = Utils.$("#backToHome");
if (backToHomeEl) {
  backToHomeEl.addEventListener("click", () => {
    window.location.href = "../index.html";
  });
}
