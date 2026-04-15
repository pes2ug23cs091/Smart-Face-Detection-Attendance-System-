const videoEl = Utils.$("#video");
const canvasEl = Utils.$("#canvas");
const logBody = Utils.$("#logTable tbody");
const sessionStateEl = Utils.$("#sessionState");
const resultEl = Utils.$("#result");
let lastLiveness = false;
let sessionTimer = null;
let sessionPin = null;
let running = false;
const recentSeen = new Map();
const dayFeedSeen = new Set();

const updateSessionBadge = () => {
  sessionStateEl.textContent = running ? "Session: running" : "Session: stopped";
  sessionStateEl.style.background = running ? "#e8f5ef" : "#ffe3e3";
  sessionStateEl.style.color = running ? "#2d6a4f" : "#c92a2a";
};

const appendLog = (name, status) => {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${Utils.formatTime(new Date())}</td>
    <td>${name}</td>
    <td>${status}</td>
  `;
  logBody.prepend(row);
};

const runRecognitionTick = async () => {
  if (!running || !videoEl.srcObject) return;

  const courseId = String(Utils.$("#courseId").value || "1");
  const requireLive = Utils.$("#requireLiveness").value === "yes";
  if (requireLive && !lastLiveness) {
    resultEl.textContent = "Session running. Liveness required before marking.";
    return;
  }

  const image = Camera.captureFrame(videoEl, canvasEl);
  const result = await Api.recognize({
    image,
    courseId,
    isLive: requireLive ? lastLiveness : false,
  });

  if (result.ok && result.data.recognized) {
    const student = result.data.student || {};
    const studentKey = String(student.student_id || student.id || student.name || "unknown");
    const now = Date.now();
    const lastSeen = recentSeen.get(studentKey) || 0;
    if (now - lastSeen < 12000) {
      return;
    }
    recentSeen.set(studentKey, now);

    const studentName = student.name || student.student_id || "Unknown";
    const alreadyMarked = String(result.data.message || "").toLowerCase().includes("already");
    const dayKey = `${new Date().toISOString().slice(0, 10)}:${studentKey}`;
    if (!dayFeedSeen.has(dayKey)) {
      appendLog(studentName, alreadyMarked ? "Already Marked" : "Present");
      dayFeedSeen.add(dayKey);
    }
    resultEl.textContent = result.data.message || "Attendance marked";
  } else if (!result.ok) {
    resultEl.textContent = "Recognition failed. Check Java and Flask services.";
  }
};

Utils.$("#startSession").addEventListener("click", async () => {
  const pin = Utils.$("#sessionPin").value.trim();
  if (pin.length < 4) {
    Utils.toast("Set a 4+ digit faculty PIN", "warning");
    return;
  }

  try {
    await Camera.startCamera(videoEl);
    sessionPin = pin;
    running = true;
    lastLiveness = false;
    recentSeen.clear();
    dayFeedSeen.clear();
    localStorage.setItem("attendanceSessionActive", "true");
    updateSessionBadge();
    Utils.toast("Locked session started", "success");

    const intervalSec = Math.max(2, Number(Utils.$("#scanInterval").value || 4));
    if (sessionTimer) clearInterval(sessionTimer);
    sessionTimer = setInterval(runRecognitionTick, intervalSec * 1000);
  } catch (err) {
    Utils.toast("Unable to start camera", "error");
  }
});

Utils.$("#checkLiveness").addEventListener("click", async () => {
  if (!videoEl.srcObject) {
    Utils.toast("Start the camera first", "warning");
    return;
  }
  const frames = await Camera.captureBurst(videoEl, canvasEl, 15, 120);
  const result = await Api.liveness({ frames });
  if (result.ok) {
    lastLiveness = !!result.data.is_live;
    Utils.toast(result.data.message || "Liveness checked", lastLiveness ? "success" : "warning");
  } else {
    Utils.toast("Liveness check failed", "error");
  }
});

Utils.$("#endSession").addEventListener("click", () => {
  const enteredPin = prompt("Enter faculty PIN to end session:") || "";
  if (!running) {
    Utils.toast("Session already stopped", "warning");
    return;
  }
  if (enteredPin !== sessionPin) {
    Utils.toast("Invalid PIN. Session remains locked.", "error");
    return;
  }

  if (sessionTimer) clearInterval(sessionTimer);
  sessionTimer = null;
  running = false;
  sessionPin = null;
  lastLiveness = false;
  recentSeen.clear();
  dayFeedSeen.clear();
  Camera.stopCamera();
  localStorage.removeItem("attendanceSessionActive");
  resultEl.textContent = "Session ended by faculty.";
  updateSessionBadge();
  Utils.toast("Session ended", "success");
});

updateSessionBadge();
