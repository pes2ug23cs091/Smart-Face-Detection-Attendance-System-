let activeStream = null;

const startCamera = async (videoEl) => {
	if (activeStream) return activeStream;
	const stream = await navigator.mediaDevices.getUserMedia({
		video: { width: 640, height: 480 },
		audio: false,
	});
	videoEl.srcObject = stream;
	await videoEl.play();
	activeStream = stream;
	return stream;
};

const stopCamera = () => {
	if (!activeStream) return;
	activeStream.getTracks().forEach((t) => t.stop());
	activeStream = null;
};

const captureFrame = (videoEl, canvasEl) => {
	const ctx = canvasEl.getContext("2d");
	canvasEl.width = videoEl.videoWidth || 640;
	canvasEl.height = videoEl.videoHeight || 480;
	ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
	return canvasEl.toDataURL("image/jpeg", 0.9).split(",")[1];
};

const captureBurst = async (videoEl, canvasEl, count = 8, intervalMs = 150) => {
	const frames = [];
	for (let i = 0; i < count; i += 1) {
		frames.push(captureFrame(videoEl, canvasEl));
		await new Promise((r) => setTimeout(r, intervalMs));
	}
	return frames;
};

window.Camera = { startCamera, stopCamera, captureFrame, captureBurst };
