import axios from 'axios';
import fastify from 'fastify';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

export const flaskUrl = 'http://ai:5001'; // Flask server URL

// Load the protobuf
const PROTO_PATH = './proto/data.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const proto = grpc.loadPackageDefinition(packageDefinition) as any;

const client = new proto.dataservice.DataService(
  'ai:50051',
  grpc.credentials.createInsecure()
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
