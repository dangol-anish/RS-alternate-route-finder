# app.py
from flask import Flask
from flask_cors import CORS
from routes import main_routes

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Register routes
app.register_blueprint(main_routes)

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0")
