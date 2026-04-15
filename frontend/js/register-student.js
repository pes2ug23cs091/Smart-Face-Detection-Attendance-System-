const videoEl = Utils.$("#video");
const canvasEl = Utils.$("#canvas");
const frameCountEl = Utils.$("#frameCount");
const videoWrap = Utils.$("#videoWrap");
const captureStatus = Utils.$("#captureStatus");
const faceCaptureCard = Utils.$("#faceCaptureCard");
let frames = [];

const angles = ["Front", "Turn Left", "Turn Right", "Look Up", "Look Down"];
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

Utils.$("#captureFace").addEventListener("click", async () => {
  const captureBtn = Utils.$("#captureFace");
  try {
    captureBtn.disabled = true;
    faceCaptureCard.style.display = "grid";
    videoWrap.style.display = "grid";
    captureStatus.textContent = "Starting camera...";
    await Camera.startCamera(videoEl);

    frames = [];
    for (let i = 0; i < angles.length; i += 1) {
      captureStatus.textContent = `Position ${i + 1}/5: ${angles[i]}`;
      await wait(1200);
      frames.push(Camera.captureFrame(videoEl, canvasEl));
      frameCountEl.textContent = `Captured: ${frames.length}`;
    }

    Camera.stopCamera();
    videoWrap.style.display = "none";
    captureStatus.textContent = "Student face successfully registered.";
    faceCaptureCard.style.display = "none";
    Utils.toast("Student face successfully registered", "success");
  } catch (err) {
    Camera.stopCamera();
    captureStatus.textContent = "Capture failed. Please try again.";
    Utils.toast("Camera permission denied", "error");
  } finally {
    captureBtn.disabled = false;
  }
});

Utils.$("#studentForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const submitBtn = e.target.querySelector("button[type='submit']");
  submitBtn.disabled = true;

  const rawStudentId = Utils.$("#studentId").value.trim();
  const canonicalStudentId = /^\d+$/.test(rawStudentId) ? String(Number(rawStudentId)) : rawStudentId;

  const payload = {
    studentId: canonicalStudentId,
    rollNumber: Utils.$("#rollNumber").value.trim(),
    name: Utils.$("#studentName").value.trim(),
    department: Utils.$("#department").value.trim(),
    year: Number(Utils.$("#year").value || 0),
    section: Utils.$("#section").value.trim(),
    passwordHash: "Student@123",
    active: true,
  };

  if (!payload.studentId || !payload.rollNumber || !payload.name) {
    Utils.toast("Student ID, Roll Number and Name are required", "warning");
    submitBtn.disabled = false;
    return;
  }

  if (frames.length < 5) {
    Utils.toast("Capture face first (5 frames)", "warning");
    submitBtn.disabled = false;
    return;
  }

  const studentRes = await Api.createStudent(payload);
  let studentCreated = studentRes.ok;
  if (!studentRes.ok) {
    const raw = JSON.stringify(studentRes.data || "").toLowerCase();
    if (raw.includes("duplicate") || raw.includes("already") || raw.includes("e11000")) {
      studentCreated = true;
      Utils.toast("Student already exists. Continuing with face registration...", "warning");
    } else {
      Utils.toast("Failed to create student", "error");
      submitBtn.disabled = false;
      return;
    }
  }

  const registerRes = await Api.register({
    studentId: canonicalStudentId,
    images: frames,
  });

  if (registerRes.ok && registerRes.data?.success !== false) {
    Utils.toast("Student created and face registered", "success");
    captureStatus.textContent = "Submitted successfully.";
    faceCaptureCard.style.display = "none";
    videoWrap.style.display = "none";
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 900);
  } else {
    const details = registerRes.data?.message || "Face service rejected request";
    if (studentCreated) {
      Utils.toast(`Student saved, but face registration failed: ${details}`, "warning");
      captureStatus.textContent = `Face registration failed: ${details}`;
    } else {
      Utils.toast(`Submit failed: ${details}`, "error");
    }
  }

  submitBtn.disabled = false;
});
