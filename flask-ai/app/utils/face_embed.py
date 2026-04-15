import numpy as np
import json
from deepface import DeepFace
from app.config import Config


def get_embedding(image: np.ndarray) -> list[float] | None:
    """
    Extract 512-D face embedding using FaceNet512 via DeepFace.
    Returns embedding vector as a Python list, or None on failure.
    """
    try:
        result = DeepFace.represent(
            img_path         = image,
            model_name       = Config.MODEL_NAME,
            detector_backend = Config.DETECTOR_BACKEND,
            enforce_detection = True
        )
        if result:
            return result[0]['embedding']
        return None
    except Exception as e:
        print(f"[face_embed] Error: {e}")
        return None


def cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    """Compute cosine similarity between two embedding vectors."""
    a = np.array(vec_a)
    b = np.array(vec_b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a, b) / (norm_a * norm_b))


def find_best_match(
    query_embedding: list[float],
    stored_encodings: list[dict]
) -> dict | None:
    """
    Compare query embedding against all stored encodings.
    Each item in stored_encodings must have 'student_id' and 'encoding_vector' (JSON string).
    Returns best match dict with 'student_id' and 'score', or None if below threshold.
    """
    student_best_scores: dict[int, float] = {}

    for record in stored_encodings:
        try:
            stored_vec = json.loads(record['encoding_vector'])
            score = cosine_similarity(query_embedding, stored_vec)
            student_id = int(record['student_id'])
            previous_best = student_best_scores.get(student_id, -1.0)
            if score > previous_best:
                student_best_scores[student_id] = score
        except Exception as e:
            print(f"[face_embed] Skipping record: {e}")
            continue

    if not student_best_scores:
        return None

    ranked = sorted(student_best_scores.items(), key=lambda item: item[1], reverse=True)
    best_student_id, best_score = ranked[0]
    second_best_score = ranked[1][1] if len(ranked) > 1 else -1.0

    if best_score < Config.SIMILARITY_THRESHOLD:
        return None

    if second_best_score >= 0 and (best_score - second_best_score) < Config.MIN_MATCH_GAP:
        print(
            f"[face_embed] Ambiguous match rejected: best={best_score:.4f}, second={second_best_score:.4f}"
        )
        return None

    return {
        'student_id': best_student_id,
        'score': best_score,
        'second_best_score': second_best_score
    }
    return None