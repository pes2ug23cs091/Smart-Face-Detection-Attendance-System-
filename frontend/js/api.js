const fetchJson = async (url, options = {}) => {
	const token = localStorage.getItem("token");
	const res = await fetch(url, {
		headers: {
			"Content-Type": "application/json",
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...(options.headers || {}),
		},
		...options,
	});
	const text = await res.text();
	try {
		return { ok: res.ok, data: JSON.parse(text), status: res.status };
	} catch {
		return { ok: res.ok, data: text, status: res.status };
	}
};

const Api = {
	facultyLogin: async (payload) => {
		const base = Utils.getApiBase();
		return fetchJson(`${base}/api/auth/faculty/login`, {
			method: "POST",
			body: JSON.stringify(payload),
		});
	},
	studentLogin: async (payload) => {
		const base = Utils.getApiBase();
		return fetchJson(`${base}/api/auth/student/login`, {
			method: "POST",
			body: JSON.stringify(payload),
		});
	},
	health: async () => {
		const base = Utils.getApiBase();
		return fetchJson(`${base}/api/health`);
	},
	courses: async () => {
		const base = Utils.getApiBase();
		return fetchJson(`${base}/api/courses`);
	},
	students: async (section) => {
		const base = Utils.getApiBase();
		const qs = section ? `?section=${encodeURIComponent(section)}` : "";
		return fetchJson(`${base}/api/students${qs}`);
	},
	studentMe: async () => {
		const base = Utils.getApiBase();
		return fetchJson(`${base}/api/students/me`);
	},
	createStudent: async (payload) => {
		const base = Utils.getApiBase();
		return fetchJson(`${base}/api/students`, {
			method: "POST",
			body: JSON.stringify(payload),
		});
	},
	register: async (payload) => {
		const base = Utils.getApiBase();
		return fetchJson(`${base}/api/face/register`, {
			method: "POST",
			body: JSON.stringify(payload),
		});
	},
	recognize: async (payload) => {
		const base = Utils.getApiBase();
		return fetchJson(`${base}/api/attendance/recognize`, {
			method: "POST",
			body: JSON.stringify(payload),
		});
	},
	liveness: async (payload) => {
		const base = Utils.getApiBase();
		return fetchJson(`${base}/api/face/liveness`, {
			method: "POST",
			body: JSON.stringify(payload),
		});
	},
	attendanceByStudent: async (studentId) => {
		const base = Utils.getApiBase();
		return fetchJson(`${base}/api/attendance/student/${encodeURIComponent(studentId)}`);
	},
	attendanceMe: async () => {
		const base = Utils.getApiBase();
		return fetchJson(`${base}/api/attendance/me`);
	},
	attendanceByCourseDate: async (courseId, date) => {
		const base = Utils.getApiBase();
		return fetchJson(`${base}/api/attendance/course/${encodeURIComponent(courseId)}?date=${encodeURIComponent(date)}`);
	},
	attendanceByDate: async (date) => {
		const base = Utils.getApiBase();
		return fetchJson(`${base}/api/attendance/date/${encodeURIComponent(date)}`);
	},
	publicRecognize: async (payload) => {
		const base = Utils.getApiBase();
		return fetchJson(`${base}/api/public/attendance/recognize`, {
			method: "POST",
			body: JSON.stringify(payload),
		});
	},
};

window.Api = Api;
