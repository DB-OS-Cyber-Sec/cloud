import { FastifyReply } from 'fastify';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

const PROTO_PATH = './proto/data.proto';

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

let currentWeatherJson: string | null = null;

const proto = grpc.loadPackageDefinition(packageDefinition) as any;

// Create gRPC client
const client = new proto.dataservice.DataService(
  'localhost:50051',
  grpc.credentials.createInsecure(),
  {
    'grpc.max_receive_message_length': 50 * 1024 * 1024,
    'grpc.max_send_message_length': 50 * 1024 * 1024,
  }
);

// Send weather data to the AI service
export const sendWeatherDataGRPC = async (
  weatherData: string
): Promise<string | undefined> => {
  console.log('Sending gRPC request...');
  try {
    return await new Promise((resolve, reject) => {
      client.GetAIPredictionsData(
        { current_weather_json: weatherData },
        (error: any, response: any) => {
          if (error) {
            console.error('gRPC error:', error);
            reject(error);
          } else {
            console.log('gRPC response received');
            resolve(response.ai_predictions_json);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error sending data to AI service:', error);
  }
  return undefined;
};
