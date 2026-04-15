import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '../../.env'))

class Config:
    # PostgreSQL
    DB_HOST     = os.getenv('DB_HOST', 'localhost')
    DB_PORT     = os.getenv('DB_PORT', '5432')
    DB_NAME     = os.getenv('DB_NAME', 'smart_attendance')
    DB_USER     = os.getenv('DB_USER', 'postgres')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'postgres')

    # Flask
    SECRET_KEY  = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key')
    DEBUG       = True

    # Face recognition
    SIMILARITY_THRESHOLD = float(os.getenv('SIMILARITY_THRESHOLD', '0.78'))
    MIN_MATCH_GAP        = float(os.getenv('MIN_MATCH_GAP', '0.04'))
    MIN_REG_FRAMES       = int(os.getenv('MIN_REG_FRAMES', '3'))
    MIN_SHARPNESS        = float(os.getenv('MIN_SHARPNESS', '80.0'))
    MIN_BLINK_COUNT      = 1        # blinks required for liveness
    FRAME_BUFFER_SIZE    = 30       # frames to analyse for liveness
    MODEL_NAME           = 'Facenet512'
    DETECTOR_BACKEND     = 'mtcnn'

    # Folder where captured face samples are persisted by student ID.
    FACE_IMAGE_STORE_DIR = os.getenv(
        'FACE_IMAGE_STORE_DIR',
        os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'stored_faces'))
    )