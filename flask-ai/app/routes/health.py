from flask import Blueprint, jsonify
from app.utils.db import get_connection

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health():
    try:
        conn = get_connection()
        conn.close()
        db_status = 'connected'
    except Exception as e:
        db_status = f'error: {str(e)}'

    return jsonify({
        'status':   'ok',
        'service':  'flask-ai',
        'database': db_status
    })