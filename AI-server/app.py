import json
import grpc
import data_pb2
import data_pb2_grpc
from openai import OpenAI
from concurrent import futures
import asyncio

class DataService(data_pb2_grpc.DataServiceServicer):
    def __init__(self):
        self.client = OpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key="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"
        )

    def format_weather_prompt(self, weather_data):
        return (
            "You are a weather prediction API that MUST return ONLY valid JSON. "
            "Analyze the following weather data and provide a typhoon prediction: "
            f"{json.dumps(weather_data, indent=2)}\n\n"
            "Return your response in this EXACT JSON format with no additional text or explanation:\n"
            "{\n"
            '  "risk_classification": "Low|Medium|High",\n'
            '  "typhoon_category": "Category X (where X is 1-5 based on Saffir-Simpson Scale)",\n'
            '  "shelter_message": "Your message about staying or seeking shelter"\n'
            "}\n\n"
            "Rules:\n"
            "1. risk_classification MUST be exactly 'Low', 'Medium', or 'High'\n"
            "2. typhoon_category MUST follow format 'Category X' where X is 1-5\n"
            "3. shelter_message should be a clear, concise instruction\n"
            "4. Response MUST be ONLY the JSON object, no other text, no code blocks"
        )

    async def GetAIPredictionsData(self, request, context):
        try:
            current_weather = json.loads(request.current_weather_json)
            
        except json.JSONDecodeError:
            context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
            context.set_details("Invalid JSON format in request")
            return data_pb2.GetAIPredictionsResponse(ai_predictions_json='{"error": "Invalid JSON format"}')

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

            # Clean up the response - remove any markdown code blocks if present
            cleaned_response = response_content.replace('```json', '').replace('```', '').strip()

            # Parse JSON and return
            json_response = json.loads(cleaned_response)
            return data_pb2.GetAIPredictionsResponse(
                ai_predictions_json=json.dumps(json_response, indent=2)
            )

        except Exception as e:
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"AI service error: {str(e)}")
            return data_pb2.GetAIPredictionsResponse(
                ai_predictions_json=json.dumps({"error": str(e)}, indent=2)
            )

async def serve():
    server = grpc.aio.server(options=[
        ('grpc.max_receive_message_length', 50 * 1024 * 1024),  # 50 MB
        ('grpc.max_send_message_length', 50 * 1024 * 1024) ])

    data_pb2_grpc.add_DataServiceServicer_to_server(DataService(), server)
    server.add_insecure_port('[::]:50051')
    await server.start()
    print("gRPC server running on port 50051...")
    await server.wait_for_termination()

if __name__ == '__main__':
    asyncio.run(serve())