# app.py
from flask import Flask, jsonify
from flask_cors import CORS
from routes import main_routes
import threading
import time
import requests

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Register routes
app.register_blueprint(main_routes)

@app.route('/ping')
def ping():
    return jsonify({'status': 'ok'}), 200

def keep_alive():
    while True:
        try:
            # Use the actual deployed server URL
            requests.get("https://roadsense-server.onrender.com/ping")
        except Exception as e:
            print("Keep-alive ping failed:", e)
        time.sleep(300)  # 5 minutes

# Start the keep-alive thread when the server starts
threading.Thread(target=keep_alive, daemon=True).start()

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0")


