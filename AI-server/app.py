# app.py
from flask import Flask, request, jsonify
from openai import OpenAI

app = Flask(__name__)

# Initialize the OpenAI client
client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key="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"  # Replace with your actual API key
)

@app.route('/generate-limerick', methods=['POST'])
def generate_limerick():
    user_message = request.json.get('message', 'Write a limerick about the wonders of GPU computing.')

    # Create a chat completion request
    completion = client.chat.completions.create(
        model="meta/llama-3.1-405b-instruct",
        messages=[{"role": "user", "content": user_message}],
        temperature=0.2,
        top_p=0.7,
        max_tokens=1024,
        stream=True
    )

    # Collect the response chunks
    response_content = ""
    for chunk in completion:
        if chunk.choices[0].delta.content is not None:
            response_content += chunk.choices[0].delta.content

    return jsonify({"limerick": response_content})

if __name__ == '__main__':
    app.run(debug=True)