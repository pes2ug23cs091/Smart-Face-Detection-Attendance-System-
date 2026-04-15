const load = async () => {
	const studentName = localStorage.getItem("studentUser") || "student";
	Utils.$("#studentIdPill").textContent = `Student: ${studentName}`;

	const res = await Api.attendanceMe();
	const rows = res.ok && Array.isArray(res.data) ? res.data : [];

	const present = rows.filter((r) => (r.status || "").toLowerCase() === "present").length;
	const total = rows.length;
	const pct = total ? ((present * 100) / total).toFixed(1) : "0.0";
	Utils.$("#overallPct").textContent = `${pct}%`;

	const today = new Date().toISOString().slice(0, 10);
	const todayRow = rows.find((r) => r.date === today);
	Utils.$("#todayStatus").textContent = todayRow ? (todayRow.status || "Present") : "Not Marked";

	const missed = rows.filter((r) => (r.status || "").toLowerCase() === "absent").length;
	Utils.$("#missedCount").textContent = String(missed);

	const tbody = document.querySelector("table.table tbody");
	tbody.innerHTML = "";
	rows.slice().sort((a, b) => String(b.date).localeCompare(String(a.date))).forEach((r) => {
		const tr = document.createElement("tr");
		tr.innerHTML = `
			<td>${r.date || "-"}</td>
			<td>${r.courseId || "-"}</td>
			<td>${(r.status || "Present").toUpperCase()}</td>
			<td>${r.timeIn || "-"}</td>
		`;
		tbody.appendChild(tr);
	});

	if (!rows.length) {
		tbody.innerHTML = '<tr><td colspan="4">No attendance records yet.</td></tr>';
	}
};

load();
setInterval(load, 15000);
