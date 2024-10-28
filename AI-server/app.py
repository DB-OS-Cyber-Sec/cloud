import json
import grpc
from flask import Flask, request, jsonify
from openai import OpenAI
import data_pb2
import data_pb2_grpc

app = Flask(__name__)

# Initialize the OpenAI client
client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key="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"
)

def get_data_from_grpc():
    """Get data from gRPC server and save to file"""
    try:
        # Create gRPC channel
        channel = grpc.insecure_channel('localhost:50051')
        stub = data_pb2_grpc.DataServiceStub(channel)
        
        # Make request
        request = data_pb2.DataRequest(request_id="weather_request")
        response = stub.GetJsonData(request)
        
        # Parse JSON data
        data = json.loads(response.json_data)
        
        # Save to file
        with open('data.json', 'w') as file:
            json.dump({"data": data}, file)
            
        return data
        
    except Exception as e:
        print(f"Error getting gRPC data: {e}")
        return None
    finally:
        if 'channel' in locals():
            channel.close()

@app.route('/predict-weather', methods=['POST'])
def predict_weather():
    try:
        # Get and save data from gRPC server
        grpc_data = get_data_from_grpc()
        if not grpc_data:
            return jsonify({"error": "Failed to get data from gRPC server"}), 500
        
        # Read the saved data
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

        # Save the response
        with open('weather_reply.json', 'w') as output_file:
            output_file.write(response_content)

        return jsonify({"prediction": response_content})

    except Exception as e:
        print(f"Error in predict_weather: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)