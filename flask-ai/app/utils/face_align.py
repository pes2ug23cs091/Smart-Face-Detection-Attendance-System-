import cv2
import numpy as np

LEFT_EYE_CENTER  = [33, 133]
RIGHT_EYE_CENTER = [362, 263]

def align_face(image: np.ndarray) -> np.ndarray:
    try:
        import mediapipe as mp
        face_mesh = mp.solutions.face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5
        )

        h, w = image.shape[:2]
        rgb  = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(rgb)
        face_mesh.close()

        if not results.multi_face_landmarks:
            return image

        landmarks = results.multi_face_landmarks[0].landmark

        left_eye  = np.mean([[landmarks[i].x * w, landmarks[i].y * h]
                              for i in LEFT_EYE_CENTER], axis=0)
        right_eye = np.mean([[landmarks[i].x * w, landmarks[i].y * h]
                              for i in RIGHT_EYE_CENTER], axis=0)

        dy    = right_eye[1] - left_eye[1]
        dx    = right_eye[0] - left_eye[0]
        angle = np.degrees(np.arctan2(dy, dx))

        eye_center_arr = np.mean([left_eye, right_eye], axis=0)
        eye_center = (float(eye_center_arr[0]), float(eye_center_arr[1]))
        M = cv2.getRotationMatrix2D(eye_center, angle, scale=1.0)
        aligned = cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC)
        return aligned

    except Exception as e:
        print(f"[face_align] Alignment failed: {e}")
        return image