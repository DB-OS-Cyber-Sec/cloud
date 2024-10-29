import json
import grpc
import logging
from concurrent import futures
import data_pb2
import data_pb2_grpc
from openai import OpenAI
from typing import Dict, Any

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class DataService(data_pb2_grpc.DataServiceServicer):
    def __init__(self):
        self.client = OpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key="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"
        )
        
    def validate_weather_data(self, weather_data: Dict[str, Any]) -> bool:
        """
        Validate the required fields in weather data.
        Returns True if valid, False otherwise.
        """
        required_fields = {'temperature', 'humidity', 'precipitation'}
        return all(field in weather_data for field in required_fields)

    def format_weather_prompt(self, weather_data: Dict[str, Any]) -> str:
        """
        Format the weather data into a prompt for the AI model.
        """
        return (
            "You are a weather expert. Based on this data: "
            f"{json.dumps(weather_data, indent=2)}, "
            "can you predict the upcoming 6 hours of data? "
            "Provide hourly predictions including temperature (°C), "
            "humidity (%), and precipitation probability (%). "
            "Return the response in valid JSON format with the following structure: "
            '{"predictions": [{"hour": 1, "temperature": X, "humidity": Y, "precipitation": Z}, ...]}'
        )

    async def GetAIPredictionsData(self, request, context):
        """
        Handle incoming weather data requests and return AI predictions.
        """
        try:
            # Parse and validate current weather conditions
            try:
                current_weather = json.loads(request.current_weather_json)
            except json.JSONDecodeError as e:
                logger.error(f"Invalid JSON format: {e}")
                context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
                context.set_details("Invalid JSON format in request")
                return data_pb2.GetAIPredictionsResponse()

            # Validate weather data structure
            if not self.validate_weather_data(current_weather):
                logger.error("Missing required weather data fields")
                context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
                context.set_details("Missing required weather data fields")
                return data_pb2.GetAIPredictionsResponse()

            logger.info(f"Received valid weather data: {current_weather}")

            # Create AI completion request
            try:
                completion = self.client.chat.completions.create(
                    model="meta/llama-3.1-405b-instruct",
                    messages=[{
                        "role": "user",
                        "content": self.format_weather_prompt(current_weather)
                    }],
                    temperature=0.2,
                    top_p=0.7,
                    max_tokens=1024,
                    stream=False
                )
                
                response_content = completion.choices[0].message.content
                
                # Validate AI response is valid JSON
                try:
                    json.loads(response_content)
                except json.JSONDecodeError:
                    logger.error("AI response is not valid JSON")
                    context.set_code(grpc.StatusCode.INTERNAL)
                    context.set_details("AI response format error")
                    return data_pb2.GetAIPredictionsResponse()

                logger.info("Successfully generated AI predictions")
                return data_pb2.GetAIPredictionsResponse(
                    ai_predictions_json=response_content
                )

            except Exception as e:
                logger.error(f"OpenAI API error: {str(e)}")
                context.set_code(grpc.StatusCode.INTERNAL)
                context.set_details("AI service error")
                return data_pb2.GetAIPredictionsResponse()

        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details("Internal server error")
            return data_pb2.GetAIPredictionsResponse()

def serve_grpc():
    """
    Initialize and run the gRPC server with proper error handling.
    """
    try:
        server = grpc.server(
            futures.ThreadPoolExecutor(max_workers=10),
            options=[
                ('grpc.max_send_message_length', 50 * 1024 * 1024),
                ('grpc.max_receive_message_length', 50 * 1024 * 1024)
            ]
        )
        data_pb2_grpc.add_DataServiceServicer_to_server(DataService(), server)
        server.add_insecure_port('[::]:50051')
        server.start()
        logger.info("gRPC server running on port 50051...")
        server.wait_for_termination()
    except Exception as e:
        logger.error(f"Server failed to start: {str(e)}")
        raise

if __name__ == '__main__':
    serve_grpc()