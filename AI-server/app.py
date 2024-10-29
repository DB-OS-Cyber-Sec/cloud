import json
import re
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

# # Function to get data from gRPC server and save it to a file
# def get_data_from_grpc():
#     """Get data from gRPC server and save to file"""
#     try:
#         # Create gRPC channel
#         channel = grpc.insecure_channel('localhost:50051')
#         stub = data_pb2_grpc.DataServiceStub(channel)
        
#         # Make a request to gRPC server
#         request = data_pb2.DataRequest(request_id="weather_request")
#         response = stub.GetJsonData(request)
        
#         # Parse the JSON data received
#         data = json.loads(response.json_data)
        
#         # Save the parsed data to a JSON file
#         with open('data.json', 'w') as file:
#             json.dump({"data": data}, file)
            
#         return data
        
#     except Exception as e:
#         print(f"Error getting gRPC data: {e}")
#         return None
#     finally:
#         if 'channel' in locals():
#             channel.close()

# Function to extract JSON structures from text encased in triple backticks
def extract_json_from_text(input_file, output_file):
    """Extract the JSON block between triple backticks from a text file and save to a new file."""
    try:
        # Read the content of the input file
        with open(input_file, 'r') as file:
            text = file.read()

        # Find the JSON block enclosed in triple backticks
        json_block = re.search(r"```json(.*?)```", text, re.DOTALL)
        
        # Check if a JSON block was found
        if json_block:
            # Extract and clean the JSON content
            json_content = json_block.group(1).strip()

            # Write the JSON content to the output file
            with open(output_file, 'w') as output:
                output.write(json_content)
                
            print(f"JSON data has been saved to {output_file}")
        else:
            print("No JSON block found in the file.")
    except Exception as e:
        print(f"Error extracting JSON block: {e}")

@app.route('/predict-weather', methods=['POST'])
def predict_weather():
    try:
        # # Get and save data from gRPC server
        # grpc_data = get_data_from_grpc()
        # if not grpc_data:
        #     return jsonify({"error": "Failed to get data from gRPC server"}), 500

        # Read the saved gRPC data from JSON file
        with open('data_typhoon.json', 'r') as file:
            weather_data = json.load(file).get('data', [])
        
        # Format the prompt for OpenAI with weather data
        user_message = f"You are a weather expert. Based on this data: {weather_data}, can you predict if there will be any typhoon in the next hour? If yes, include the Risk Classification(Low/Med/High), Category of the typhoon(Saffir-Simpson Scale), and a message to stay/seek shelter. Output should be json format"

        # Create a chat completion request using the OpenAI client
        completion = client.chat.completions.create(
            model="meta/llama-3.1-405b-instruct",
            messages=[{"role": "user", "content": user_message}],
            temperature=0.2,
            top_p=0.7,
            max_tokens=1024,
            stream=True
        )

        # Collect and build the response content from OpenAI
        response_content = ""
        for chunk in completion:
            if chunk.choices[0].delta.content is not None:
                response_content += chunk.choices[0].delta.content

        # Save the response to a text file
        with open('weather_reply.txt', 'w') as output_file:
            output_file.write(response_content)
        
        # Extract JSON from the text response and save to a new JSON file
        extract_json_from_text('weather_reply.txt', 'weather_output.json')
        
        # Return the full response content to the client
        return jsonify({"prediction": response_content})

    except Exception as e:
        print(f"Error in predict_weather: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
