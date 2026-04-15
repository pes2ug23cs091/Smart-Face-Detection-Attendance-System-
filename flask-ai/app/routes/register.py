from flask import Blueprint, request, jsonify
import numpy as np
import cv2
import base64
import json
import os
from datetime import datetime
from app.utils.face_align import align_face
from app.utils.face_embed import get_embedding
from app.utils.db         import get_connection
from app.config import Config

register_bp = Blueprint('register', __name__)

def _decode_image(b64_string: str) -> np.ndarray:
    if ',' in b64_string:
        b64_string = b64_string.split(',', 1)[1]
    img_data = base64.b64decode(b64_string)
    arr      = np.frombuffer(img_data, np.uint8)
    return cv2.imdecode(arr, cv2.IMREAD_COLOR)


def _get_student_store_paths(student_id: int) -> tuple[str, str, str]:
    base_dir = Config.FACE_IMAGE_STORE_DIR
    student_dir = os.path.join(base_dir, str(student_id))
    original_dir = os.path.join(student_dir, 'original')
    aligned_dir = os.path.join(student_dir, 'aligned')
    os.makedirs(original_dir, exist_ok=True)
    os.makedirs(aligned_dir, exist_ok=True)
    return student_dir, original_dir, aligned_dir


@register_bp.route('/register', methods=['POST'])
def register_student():
    """
    Expects JSON:
    {
        "student_id": 1,
        "images": ["<base64_image>", ...]   // 5–20 images
    }
    """
    data       = request.get_json()
    student_id = data.get('student_id')
    images_b64 = data.get('images', [])

    if not student_id or not images_b64:
        return jsonify({'error': 'student_id and images are required'}), 400

    try:
        student_id = int(student_id)
    except Exception:
        return jsonify({'error': 'student_id must be numeric'}), 400

    student_dir, original_dir, aligned_dir = _get_student_store_paths(student_id)
    ts = datetime.utcnow().strftime('%Y%m%d_%H%M%S_%f')

    embeddings = []
    saved_original_files = []
    saved_aligned_files = []

    for idx, b64 in enumerate(images_b64, start=1):
        try:
            img       = _decode_image(b64)
            if img is None:
                continue

            original_name = f"{ts}_{idx:02d}.jpg"
            original_path = os.path.join(original_dir, original_name)
            cv2.imwrite(original_path, img)
            saved_original_files.append(original_path)

            aligned   = align_face(img)
            aligned_name = f"{ts}_{idx:02d}.jpg"
            aligned_path = os.path.join(aligned_dir, aligned_name)
            cv2.imwrite(aligned_path, aligned)
            saved_aligned_files.append(aligned_path)

            embedding = get_embedding(aligned)
            if embedding:
                embeddings.append(embedding)
        except Exception as e:
            print(f"[register] Skipping frame: {e}")
            continue

    if len(embeddings) < Config.MIN_REG_FRAMES:
        return jsonify({
            'error': f'Need at least {Config.MIN_REG_FRAMES} clear face frames. Captured valid frames: {len(embeddings)}'
        }), 422

    # Keep one embedding per captured frame so recognition can match across angles.
    avg_embedding = np.mean(embeddings, axis=0).tolist()

    # Store in database
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            # Ensure FK parent exists for PostgreSQL-based face table.
            cur.execute("""
                INSERT INTO students (student_id, name, roll_number, department, year, is_active)
                VALUES (%s, %s, %s, %s, %s, TRUE)
                ON CONFLICT (student_id) DO NOTHING
            """, (
                student_id,
                f"Student {student_id}",
                f"AUTO{student_id}",
                'General',
                1,
            ))

            # Persist where this student's captured face images are stored.
            cur.execute("""
                UPDATE students
                SET face_encoding_path = %s
                WHERE student_id = %s
            """, (student_dir, student_id))

            # Remove old encodings for this student
            cur.execute("DELETE FROM face_encodings WHERE student_id = %s", (student_id,))
            # Insert per-frame encodings and one averaged encoding for robustness.
            for i, embedding in enumerate(embeddings, start=1):
                cur.execute("""
                    INSERT INTO face_encodings (student_id, encoding_vector, model_used)
                    VALUES (%s, %s, %s)
                """, (student_id, json.dumps(embedding), f'Facenet512_frame_{i}'))

            cur.execute("""
                INSERT INTO face_encodings (student_id, encoding_vector, model_used)
                VALUES (%s, %s, %s)
            """, (student_id, json.dumps(avg_embedding), 'Facenet512_avg'))
            conn.commit()
    finally:
        conn.close()

    return jsonify({
        'success':         True,
        'student_id':      student_id,
        'frames_used':     len(embeddings),
        'embedding_size':  len(avg_embedding),
        'stored_embeddings': len(embeddings) + 1,
        'stored_original_images': len(saved_original_files),
        'stored_aligned_images': len(saved_aligned_files),
        'student_face_store_path': student_dir
    })