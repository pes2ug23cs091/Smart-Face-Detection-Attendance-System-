Utils.$("#runReport").addEventListener("click", async () => {
  const courseId = Utils.$("#courseId").value.trim();
  const date = Utils.$("#fromDate").value || new Date().toISOString().slice(0, 10);
  const tbody = Utils.$("#reportTable tbody");
  tbody.innerHTML = "";

  if (!courseId) {
    Utils.toast("Enter course ID", "warning");
    return;
  }

  const result = await Api.attendanceByCourseDate(courseId, date);
  if (!result.ok) {
    Utils.toast("Failed to load report", "error");
    return;
  }

  (result.data || []).forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.date || ""}</td>
      <td>${row.studentId || ""}</td>
      <td>${row.courseId || ""}</td>
      <td>${row.status || ""}</td>
      <td>${row.confidenceScore ?? ""}</td>
    `;
    tbody.appendChild(tr);
  });

  Utils.toast("Report generated", "success");
});
