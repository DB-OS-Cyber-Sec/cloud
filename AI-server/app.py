# app.py
import json
from flask import Flask, request, jsonify
from openai import OpenAI

app = Flask(__name__)

# Initialize the OpenAI client
client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key="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"  # Replace with your actual API key
)

@app.route('/predict-weather', methods=['POST'])
def predict_weather():
    # Get user input data from the request
    with open('data.json', 'r') as file:
        weather_data = json.load(file).get('data', [])
    
    # Format the prompt message with weather data
    user_message = f"You are a weather expert. Based on this data: {weather_data}, can you predict the upcoming 6 hours of data? Include temperature, humidity, and precipitation, and present in the form of json"

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

    # Print the response
    print("Response from API:", response_content)

    # Save the response to a file
    with open('weather_reply.json', 'w') as output_file:
        output_file.write(response_content)

    # Return the response as JSON
    return jsonify({"prediction": response_content})

if __name__ == '__main__':
    app.run(debug=True)