(() => {
  const page = window.location.pathname.split("/").pop();
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  const facultyPages = ["dashboard.html", "register-student.html", "mark-attendance.html", "reports.html"];
  const studentPages = ["student-dashboard.html"];

  if (page === "login.html" || page === "index.html" || page === "") {
    return;
  }

  if (!token || !role) {
    window.location.href = "login.html";
    return;
  }

  if (facultyPages.includes(page) && role !== "FACULTY") {
    window.location.href = "student-dashboard.html";
    return;
  }

  if (studentPages.includes(page) && role !== "STUDENT") {
    window.location.href = "dashboard.html";
    return;
  }

  const sessionActive = localStorage.getItem("attendanceSessionActive") === "true";
  if (sessionActive && page !== "mark-attendance.html" && role === "FACULTY") {
    window.location.href = "mark-attendance.html";
  }
})();
