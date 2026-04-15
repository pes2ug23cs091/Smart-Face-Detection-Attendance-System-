from flask import Blueprint, request, jsonify
import base64
import cv2
import numpy as np
from app.utils.liveness import check_liveness_frames

liveness_bp = Blueprint('liveness', __name__)


def _decode_image(b64_string: str) -> np.ndarray:
    img_data = base64.b64decode(b64_string)
    arr = np.frombuffer(img_data, np.uint8)
    return cv2.imdecode(arr, cv2.IMREAD_COLOR)


@liveness_bp.route('/liveness', methods=['POST'])
def liveness():
    """
    Expects JSON:
    {
        "frames": ["<base64_image>", ...]
    }
    """
    data = request.get_json() or {}
    frames_b64 = data.get('frames') or data.get('images') or []

    if not frames_b64:
        return jsonify({'error': 'frames are required'}), 400

    frames = []
    for b64 in frames_b64:
        try:
            frames.append(_decode_image(b64))
        except Exception as e:
            print(f"[liveness] Skipping frame: {e}")
            continue

    if not frames:
        return jsonify({'error': 'No valid frames provided'}), 422

    result = check_liveness_frames(frames)
    return jsonify(result)