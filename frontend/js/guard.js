(() => {
  const page = window.location.pathname.split("/").pop();
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  const facultyPages = ["dashboard.html", "register-student.html", "mark-attendance.html", "reports.html"];
  const studentPages = ["student-dashboard.html"];
  const adminPages = ["admin-dashboard.html"];

  if (page === "login.html" || page === "index.html" || page === "") {
    return;
  }

  if (!token || !role) {
    window.location.href = "login.html";
    return;
  }

  if (adminPages.includes(page) && role !== "ADMIN") {
    window.location.href = "login.html";
    return;
  }

  if (facultyPages.includes(page) && role !== "FACULTY") {
    if (role === "ADMIN") {
      window.location.href = "admin-dashboard.html";
    } else {
      window.location.href = "student-dashboard.html";
    }
    return;
  }

  if (studentPages.includes(page) && role !== "STUDENT") {
    if (role === "ADMIN") {
      window.location.href = "admin-dashboard.html";
    } else {
      window.location.href = "dashboard.html";
    }
    return;
  }

  const sessionActive = localStorage.getItem("attendanceSessionActive") === "true";
  if (sessionActive && page !== "mark-attendance.html" && role === "FACULTY") {
    window.location.href = "mark-attendance.html";
  }
})();
