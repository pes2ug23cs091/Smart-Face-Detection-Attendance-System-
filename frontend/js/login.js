const apiBaseInput = Utils.$("#apiBase");
apiBaseInput.value = Utils.getApiBase();

const tabFaculty = Utils.$("#tabFaculty");
const tabStudent = Utils.$("#tabStudent");
const facultyForm = Utils.$("#facultyForm");
const studentForm = Utils.$("#studentForm");

const switchRole = (role) => {
  const isFaculty = role === "faculty";
  tabFaculty.classList.toggle("active", isFaculty);
  tabStudent.classList.toggle("active", !isFaculty);
  facultyForm.classList.toggle("active", isFaculty);
  studentForm.classList.toggle("active", !isFaculty);
};

tabFaculty.addEventListener("click", () => switchRole("faculty"));
tabStudent.addEventListener("click", () => switchRole("student"));

facultyForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  Utils.setApiBase(apiBaseInput.value.trim() || "http://127.0.0.1:8080");
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
  Utils.setApiBase(apiBaseInput.value.trim() || "http://127.0.0.1:8080");
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

Utils.$("#checkHealth").addEventListener("click", async () => {
  Utils.setApiBase(apiBaseInput.value.trim() || "http://127.0.0.1:8080");
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
