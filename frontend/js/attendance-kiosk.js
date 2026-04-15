const videoEl = Utils.$("#video");
const canvasEl = Utils.$("#canvas");
const logBody = Utils.$("#kioskLog tbody");
const statusEl = Utils.$("#kioskStatus");
let started = false;
let inFlight = false;
const recentSeen = new Map();
const dayFeedSeen = new Set();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const appendLog = (name, status) => {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${Utils.formatTime(new Date())}</td>
    <td>${name}</td>
    <td>${status}</td>
  `;
  logBody.prepend(tr);
};

const tick = async () => {
  if (!started || !videoEl.srcObject || inFlight) return;
  inFlight = true;

  const courseId = String(Utils.$("#courseId").value || "1");
  try {
    const image = Camera.captureFrame(videoEl, canvasEl);
    const result = await Api.publicRecognize({ image, courseId, isLive: false });

    if (result.ok && result.data?.recognized) {
      const student = result.data.student || {};
      const studentName = student.name || student.student_id || "Unknown";
      const studentKey = String(student.student_id || student.id || studentName || "unknown");
      const dayKey = `${new Date().toISOString().slice(0, 10)}:${studentKey}`;
      const now = Date.now();
      const lastSeen = recentSeen.get(studentKey) || 0;
      if (now - lastSeen < 12000) {
        return;
      }
      recentSeen.set(studentKey, now);

      const attendanceMarked = result.data.attendance_marked === true;
      const alreadyMarked = String(result.data.message || "").toLowerCase().includes("already") || !attendanceMarked;

      if (!dayFeedSeen.has(dayKey)) {
        appendLog(studentName, alreadyMarked ? "Already Marked" : "Present");
        dayFeedSeen.add(dayKey);
      }

      statusEl.textContent = alreadyMarked
        ? `${studentName}: attendance already marked for today.`
        : `${studentName}: attendance marked successfully.`;
      return;
    }

    if (result.ok && result.data?.message) {
      statusEl.textContent = result.data.message;
    } else if (!result.ok) {
      statusEl.textContent = "Recognition service unavailable. Check backend services.";
    }
  } finally {
    inFlight = false;
  }
};

const runAutoLoop = async () => {
  while (started) {
    await tick();
    await sleep(1400);
  }
};

Utils.$("#startKiosk").addEventListener("click", async () => {
  try {
    await Camera.startCamera(videoEl);
    started = true;
    statusEl.textContent = "Camera started. Auto recognition is running.";
    Utils.toast("Attendance camera started", "success");
    runAutoLoop();
  } catch (e) {
    Utils.toast("Unable to access camera", "error");
  }
});

Utils.$("#stopKiosk").addEventListener("click", () => {
  started = false;
  inFlight = false;
  recentSeen.clear();
  dayFeedSeen.clear();
  Camera.stopCamera();
  statusEl.textContent = "Stopped.";
});

Utils.$("#openLogin").addEventListener("click", () => {
  window.location.href = "./pages/login.html";
});
