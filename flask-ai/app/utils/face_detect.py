import cv2
import numpy as np

def detect_faces(image: np.ndarray) -> list[dict]:
    """
    Detect faces using OpenCV DNN as a fast first pass.
    Returns list of dicts with 'box' [x, y, w, h] and 'confidence'.
    """
    h, w = image.shape[:2]

    # Use DeepFace with MTCNN for accurate detection
    try:
        from deepface import DeepFace
        faces = DeepFace.extract_faces(
            img_path       = image,
            detector_backend = 'mtcnn',
            enforce_detection = False
        )
        results = []
        for face in faces:
            region = face.get('facial_area', {})
            results.append({
                'box':        [region.get('x',0), region.get('y',0),
                                region.get('w',0), region.get('h',0)],
                'confidence': face.get('confidence', 0.0),
                'face_img':   face.get('face', None)
            })
        return results
    except Exception as e:
        print(f"[face_detect] Error: {e}")
        return []


def draw_faces(image: np.ndarray, faces: list[dict]) -> np.ndarray:
    """Draw bounding boxes on image for debugging."""
    img = image.copy()
    for f in faces:
        x, y, w, h = f['box']
        cv2.rectangle(img, (x, y), (x+w, y+h), (0, 255, 0), 2)
        cv2.putText(img, f"{f['confidence']:.2f}", (x, y-10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0,255,0), 1)
    return img