from flask import Blueprint, request, jsonify
import numpy as np
import cv2
import base64
from app.utils.face_align  import align_face
from app.utils.face_embed  import get_embedding, find_best_match
from app.utils.db          import fetch_all_encodings, fetch_student
from app.config            import Config

recognize_bp = Blueprint('recognize', __name__)

def _decode_image(b64_string: str) -> np.ndarray:
    if ',' in b64_string:
        b64_string = b64_string.split(',', 1)[1]
    img_data = base64.b64decode(b64_string)
    arr      = np.frombuffer(img_data, np.uint8)
    return cv2.imdecode(arr, cv2.IMREAD_COLOR)


@recognize_bp.route('/recognize', methods=['POST'])
def recognize():
    """
    Expects JSON:
    {
        "image":       "<base64_image>",
        "course_id":   3,
        "is_live":     true
    }
    """
    data      = request.get_json()
    image_b64 = data.get('image')
    is_live   = data.get('is_live', False)

    if not image_b64:
        return jsonify({'error': 'image is required'}), 400

    # Decode and align
    try:
        img = _decode_image(image_b64)
    except Exception:
        return jsonify({'recognized': False, 'message': 'Invalid image payload'}), 400

    if img is None:
        return jsonify({'recognized': False, 'message': 'Could not decode image'}), 400

    try:
        aligned = align_face(img)
    except Exception:
        return jsonify({'recognized': False, 'message': 'Face alignment failed'}), 422

    # Reject blurry frames to reduce accidental/random matches.
    gray = cv2.cvtColor(aligned, cv2.COLOR_BGR2GRAY)
    sharpness = cv2.Laplacian(gray, cv2.CV_64F).var()
    if sharpness < Config.MIN_SHARPNESS:
        return jsonify({
            'recognized': False,
            'message': 'Image too blurry. Please look at camera and hold still.',
            'sharpness': round(float(sharpness), 2)
        }), 200

    # Get embedding
    embedding = get_embedding(aligned)
    if not embedding:
        return jsonify({'recognized': False, 'message': 'No face detected in image'}), 422

    # Load all stored encodings and find best match
    stored   = fetch_all_encodings()
    match    = find_best_match(embedding, stored)

    if not match:
        return jsonify({'recognized': False, 'message': 'Face not recognized'}), 200

    student = fetch_student(match['student_id'])
    if not student:
        return jsonify({'recognized': False, 'message': 'Student record not found'}), 200

    return jsonify({
        'recognized':   True,
        'student':      student,
        'score':        round(match['score'], 4),
        'second_best_score': round(float(match.get('second_best_score', -1.0)), 4),
        'is_live':      is_live,
        'message':      'Face recognized'
    })