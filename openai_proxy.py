from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin

import requests
import os

api_key = os.environ["OPENAI_API_KEY"]

app = Flask(__name__)

cors = CORS(app)

TARGET_SERVER_URL = "https://api.openai.com/v1/chat/completions"

@app.route('/complete', methods=['POST'])
def complete():
    try:
        # Extract headers from the original request
        # headers = dict(request.headers)
        headers = {}
        # You might want to set or overwrite certain headers, like ensuring the correct Authorization token is used
        headers['Authorization'] = f'Bearer {api_key}'  # replace with your secure method of fetching the key
        headers['Content-Type'] =  'application/json'

        # Forward the received JSON data and headers to OpenAI's API
        response = requests.post(TARGET_SERVER_URL, json=request.json, headers=headers)
        
        # Check if the request was successful
        response.raise_for_status()

        # Return the response received from OpenAI's API (along with its headers) to the original client
        # return (jsonify(response.json()), response.status_code, dict(response.headers))
        return jsonify(response.json()), response.status_code

    except requests.RequestException as e:
        # Handle any errors during the forwarding process
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5322)
