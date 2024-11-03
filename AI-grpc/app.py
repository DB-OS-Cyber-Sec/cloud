import json
import grpc
import data_pb2
import data_pb2_grpc
from openai import OpenAI
from flask import Flask, jsonify, request
from concurrent.futures import ThreadPoolExecutor
import asyncio
from functools import wraps
import threading

app = Flask(__name__)

class DataService(data_pb2_grpc.DataServiceServicer):
    def __init__(self):
        self.client = OpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key="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"
        )

    def format_weather_prompt(self, weather_data):
        if isinstance(weather_data, str):
            try:
                weather_data = json.loads(weather_data)
            except json.JSONDecodeError:
                return "Error: Invalid JSON data received"

        try:
            latest_data = weather_data[0] if isinstance(weather_data, list) else weather_data
            formatted_data = {
                "location": {
                    "latitude": 14.5995,
                    "longitude": 120.9842,
                    "name": "Manila"
                },
                "current_conditions": {
                    "time": latest_data.get("time", ""),
                    "cloud_base": latest_data.get("values", {}).get("cloudBase", 0),
                    "cloud_ceiling": latest_data.get("values", {}).get("cloudCeiling", 0),
                    "cloud_cover": latest_data.get("values", {}).get("cloudCover", 0),
                    "dew_point": latest_data.get("values", {}).get("dewPoint", 0),
                    "freezing_rain_intensity": latest_data.get("values", {}).get("freezingRainIntensity", 0),
                    "humidity": latest_data.get("values", {}).get("humidity", 0),
                    "precipitation_probability": latest_data.get("values", {}).get("precipitationProbability", 0),
                    "pressure_surface_level": latest_data.get("values", {}).get("pressureSurfaceLevel", 0),
                    "rain_intensity": latest_data.get("values", {}).get("rainIntensity", 0),
                    "sleet_intensity": latest_data.get("values", {}).get("sleetIntensity", 0),
                    "snow_intensity": latest_data.get("values", {}).get("snowIntensity", 0),
                    "temperature": latest_data.get("values", {}).get("temperature", 0),
                    "temperature_apparent": latest_data.get("values", {}).get("temperatureApparent", 0),
                    "uv_health_concern": latest_data.get("values", {}).get("uvHealthConcern", 0),
                    "uv_index": latest_data.get("values", {}).get("uvIndex", 0),
                    "visibility": latest_data.get("values", {}).get("visibility", 0),
                    "weather_code": latest_data.get("values", {}).get("weatherCode", 0),
                    "wind_direction": latest_data.get("values", {}).get("windDirection", 0),
                    "wind_gust": latest_data.get("values", {}).get("windGust", 0),
                    "wind_speed": latest_data.get("values", {}).get("windSpeed", 0)
                }
            }
        except (AttributeError, IndexError, KeyError) as e:
            print(f"Error processing weather data: {e}")
            formatted_data = weather_data

        return (
            "You are a weather prediction API that MUST return ONLY valid JSON. "
            "Analyze the following weather data and provide a typhoon prediction along with a 1-hour forecast: "
            f"{json.dumps(formatted_data, indent=2)}\n\n"
            "Return your response in this EXACT JSON format with no additional text or explanation:\n"
            "{\n"
                '  "risk_classification": "Low|Medium|High",\n'
                '  "typhoon_category": "Category X (where X is 1-5 based on Saffir-Simpson Scale)",\n'
                '  "shelter_message": "Your message about staying or seeking shelter",\n'
                '  "one_hour_forecast": {\n'
                '      "time": "forecast time",\n'
                '      "humidity": "percentage",\n'
                '      "precipitation_probability": "percentage",\n'
                '      "temperature": "temperature in degrees Celsius",\n'
                '      "temperature_apparent": "apparent temperature in degrees Celsius",\n'
                '      "wind_direction": "direction in degrees",\n'
                '      "wind_gust": "speed in km/h",\n'
                '      "wind_speed": "speed in km/h"\n'
            '  }\n'
                "}\n\n"
                "Rules:\n"
                "1. risk_classification MUST be exactly 'Low', 'Medium', or 'High'\n"
                "2. typhoon_category MUST follow format 'Category X' where X is 1-5\n"
                "3. shelter_message should be a clear, concise instruction\n"
                "4. one_hour_forecast must include accurate values for all listed parameters\n"
                "5. Response MUST be ONLY the JSON object, no other text, no code blocks"

                    )

    async def GetAIPredictionsData(self, request, context):
        try:
            completion = self.client.chat.completions.create(
                model="meta/llama-3.1-405b-instruct",
                messages=[{
                    "role": "user",
                    "content": self.format_weather_prompt(request.current_weather_json)
                }],
                temperature=0.2,
                top_p=0.7,
                max_tokens=1024,
                stream=False
            )

            response_content = completion.choices[0].message.content
            cleaned_response = response_content.replace('```json', '').replace('```', '').strip()
            
            try:
                json_response = json.loads(cleaned_response)
                return data_pb2.GetAIPredictionsResponse(
                    ai_predictions_json=json.dumps(json_response, indent=2)
                )
            except json.JSONDecodeError as e:
                print(f"Error parsing AI response: {e}")
                return data_pb2.GetAIPredictionsResponse(
                    ai_predictions_json=json.dumps({
                        "error": "Failed to parse AI response",
                        "raw_response": cleaned_response
                    }, indent=2)
                )

        except Exception as e:
            print(f"Server error: {str(e)}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"AI service error: {str(e)}")
            return data_pb2.GetAIPredictionsResponse(
                ai_predictions_json=json.dumps({"error": str(e)}, indent=2)
            )

# Shared DataService instance
data_service = DataService()

def async_to_sync(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        return asyncio.run(f(*args, **kwargs))
    return wrapper

# Flask routes
@app.route('/api/weather/prediction', methods=['POST'])
async def get_weather_prediction():
    try:
        weather_data = request.json
        if not weather_data:
            return jsonify({"error": "No weather data provided"}), 400

        # Create gRPC request
        grpc_request = data_pb2.GetAIPredictionsRequest(
            current_weather_json=json.dumps(weather_data)
        )
        
        # Use the shared DataService instance
        response = await data_service.GetAIPredictionsData(grpc_request, None)
        return jsonify(json.loads(response.ai_predictions_json))

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "services": {
            "flask": "running",
            "grpc": "running",
            "openai": "connected"
        }
    })

async def run_grpc_server():
    server = grpc.aio.server()
    data_pb2_grpc.add_DataServiceServicer_to_server(data_service, server)
    server.add_insecure_port('[::]:50051')
    await server.start()
    print("gRPC server running on port 50051...")
    await server.wait_for_termination()

def run_flask_server():
    app.run(host='0.0.0.0', port=5000, debug=False, use_reloader=False)

async def main():
    # Create event loop for the main thread
    loop = asyncio.get_event_loop()
    
    # Start gRPC server in the background
    grpc_task = loop.create_task(run_grpc_server())
    
    # Start Flask in a separate thread
    flask_thread = threading.Thread(target=run_flask_server)
    flask_thread.daemon = True
    flask_thread.start()
    
    try:
        # Keep the main loop running
        await grpc_task
    except KeyboardInterrupt:
        print("Shutting down servers...")

if __name__ == '__main__':
    asyncio.run(main())