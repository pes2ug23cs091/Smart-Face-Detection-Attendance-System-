from flask import Flask
from flask_cors import CORS
from app.config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)

    from app.routes.register   import register_bp
    from app.routes.recognize  import recognize_bp
    from app.routes.liveness   import liveness_bp
    from app.routes.health     import health_bp

    app.register_blueprint(register_bp,  url_prefix='/api')
    app.register_blueprint(recognize_bp, url_prefix='/api')
    app.register_blueprint(liveness_bp,  url_prefix='/api')
    app.register_blueprint(health_bp,    url_prefix='/api')

    return app