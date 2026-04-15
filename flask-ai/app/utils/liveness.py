import cv2
import numpy as np
import mediapipe as mp

mp_face_mesh = mp.solutions.face_mesh

# MediaPipe landmark indices for Eye Aspect Ratio (EAR)
LEFT_EYE_LANDMARKS  = [33, 160, 158, 133, 153, 144]
RIGHT_EYE_LANDMARKS = [362, 385, 387, 263, 373, 380]

EAR_THRESHOLD   = 0.25   # below this = eye is closed
EAR_CONSEC_FRAMES = 2    # consecutive frames eye must be closed


def _eye_aspect_ratio(landmarks, eye_indices, w, h) -> float:
    """Calculate Eye Aspect Ratio (EAR) from MediaPipe landmarks."""
    pts = np.array([[landmarks[i].x * w, landmarks[i].y * h]
                    for i in eye_indices])
    # Vertical distances
    A = np.linalg.norm(pts[1] - pts[5])
    B = np.linalg.norm(pts[2] - pts[4])
    # Horizontal distance
    C = np.linalg.norm(pts[0] - pts[3])
    ear = (A + B) / (2.0 * C) if C != 0 else 0.0
    return ear


def check_liveness_frames(frames: list[np.ndarray]) -> dict:
    """
    Analyse a sequence of frames for eye blink detection.
    Returns {'is_live': bool, 'blink_count': int, 'message': str}
    """
    blink_count    = 0
    consec_closed  = 0
    eye_was_closed = False

    with mp_face_mesh.FaceMesh(
        static_image_mode    = False,
        max_num_faces        = 1,
        refine_landmarks     = True,
        min_detection_confidence = 0.5,
        min_tracking_confidence  = 0.5
    ) as face_mesh:

        for frame in frames:
            h, w = frame.shape[:2]
            rgb  = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            result = face_mesh.process(rgb)

            if not result.multi_face_landmarks:
                continue

            landmarks = result.multi_face_landmarks[0].landmark
            left_ear  = _eye_aspect_ratio(landmarks, LEFT_EYE_LANDMARKS,  w, h)
            right_ear = _eye_aspect_ratio(landmarks, RIGHT_EYE_LANDMARKS, w, h)
            avg_ear   = (left_ear + right_ear) / 2.0

            if avg_ear < EAR_THRESHOLD:
                consec_closed += 1
                eye_was_closed = True
            else:
                if eye_was_closed and consec_closed >= EAR_CONSEC_FRAMES:
                    blink_count   += 1
                consec_closed  = 0
                eye_was_closed = False

    is_live = blink_count >= Config.MIN_BLINK_COUNT
    return {
        'is_live':     is_live,
        'blink_count': blink_count,
        'message':     'Liveness confirmed' if is_live else 'No blink detected — possible spoof'
    }

from app.config import Config