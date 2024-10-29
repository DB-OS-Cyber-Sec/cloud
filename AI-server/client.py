import asyncio
import json
import grpc
import data_pb2
import data_pb2_grpc

async def run_client():
    # Create channel and stub
    async with grpc.aio.insecure_channel('localhost:50051') as channel:
        stub = data_pb2_grpc.DataServiceStub(channel)
        
        # Sample weather data with more detailed typhoon-relevant parameters
        sample_weather_data = {
    "data": [
        {
            "time": "2024-10-28T15:38:00Z",
            "values": {
                "cloudBase": 0.4,
                "cloudCeiling": 0.4,
                "cloudCover": 100,
                "dewPoint": 24.05,
                "freezingRainIntensity": 0,
                "humidity": 83.5,
                "precipitationProbability": 0,
                "pressureSurfaceLevel": 1004.93,
                "rainIntensity": 0,
                "sleetIntensity": 0,
                "snowIntensity": 0,
                "temperature": 27.05,
                "temperatureApparent": 30.19,
                "uvHealthConcern": 0,
                "uvIndex": 0,
                "visibility": 16,
                "weatherCode": 1001,
                "windDirection": 305.69,
                "windGust": 7.22,
                "windSpeed": 4.13
            }
        },
        {
            "time": "2024-10-28T15:39:00Z",
            "values": {
                "cloudBase": 0.81,
                "cloudCeiling": 9.49,
                "cloudCover": 100,
                "dewPoint": 24.04,
                "freezingRainIntensity": 0,
                "humidity": 83.52,
                "precipitationProbability": 0,
                "pressureSurfaceLevel": 1004.92,
                "rainIntensity": 0,
                "sleetIntensity": 0,
                "snowIntensity": 0,
                "temperature": 27.04,
                "temperatureApparent": 30.17,
                "uvHealthConcern": 0,
                "uvIndex": 0,
                "visibility": 16,
                "weatherCode": 1001,
                "windDirection": 302.72,
                "windGust": 7.21,
                "windSpeed": 4.13
            }
        },
        {
            "time": "2024-10-28T15:40:00Z",
            "values": {
                "cloudBase": 0.81,
                "cloudCeiling": 9.49,
                "cloudCover": 100,
                "dewPoint": 24.04,
                "freezingRainIntensity": 0,
                "humidity": 83.55,
                "precipitationProbability": 0,
                "pressureSurfaceLevel": 1004.91,
                "rainIntensity": 0,
                "sleetIntensity": 0,
                "snowIntensity": 0,
                "temperature": 27.03,
                "temperatureApparent": 30.16,
                "uvHealthConcern": 0,
                "uvIndex": 0,
                "visibility": 16,
                "weatherCode": 1001,
                "windDirection": 302.72,
                "windGust": 7.19,
                "windSpeed": 4.12
            }
        }
    ]
}


        # Create request
        request = data_pb2.GetAIPredictionsRequest(
            current_weather_json=json.dumps(sample_weather_data)
        )

        try:
            # Make the call
            print("Sending request to server...")
            print("\nRequest Data:")
            print("-------------")
            print(json.dumps(sample_weather_data, indent=2))
            
            response = await stub.GetAIPredictionsData(request)
            
            # Parse and print the response
            print("\nServer Response:")
            print("----------------")
            predictions = json.loads(response.ai_predictions_json)
            print(json.dumps(predictions, indent=2))
            
        except grpc.RpcError as e:
            print(f"RPC failed: {str(e)}")
            print(f"Details: {e.details()}")  # More detailed error information
            print(f"Code: {e.code()}")        # Error code

if __name__ == '__main__':
    asyncio.run(run_client())