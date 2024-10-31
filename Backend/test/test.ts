import axios from 'axios';
import fastify from 'fastify';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

const app = fastify({ logger: true });

// Load the protobuf
const PROTO_PATH = '../../proto/data.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const proto = grpc.loadPackageDefinition(packageDefinition) as any;

let currentWeatherJson = null as any;

// Set up API key and endpoint
const apiKey = 'ZGEA8P4Sp7IS7hdJYvTZlKj6T1uJqdZ4';
const apiUrl = 'https://api.tomorrow.io/v4/weather/forecast';

const location = {
  lat: 14.5995,
  lon: 120.9842,
};

// Route to test getCurrentConditions
app.get('/test/current_conditions', async (request, reply) => {
  try {
    const response = await axios.get(apiUrl, {
      params: {
        apikey: apiKey,
        location: `${location.lat},${location.lon}`,
        timesteps: '1m',
        units: 'metric',
      },
    });

    // Extract relevant data and format it
    const minutelyData = response.data.timelines.minutely;
    currentWeatherJson = JSON.stringify(minutelyData);
    console.log('Current weather conditions stored');

    return reply.send(JSON.parse(currentWeatherJson));
  } catch (err) {
    console.error('Error fetching weather data:', err);
    return reply
      .status(500)
      .send({ error: 'Failed to fetch current conditions' });
  }
});

// Function to get AI predictions
function getAIPredictions(currentWeatherJson: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = new proto.dataservice.DataService(
      'localhost:50051',
      grpc.credentials.createInsecure(),
      {
        'grpc.max_receive_message_length': 50 * 1024 * 1024,
        'grpc.max_send_message_length': 50 * 1024 * 1024,
      }
    );

    console.log('Sending gRPC request...');

    client.GetAIPredictionsData(
      { current_weather_json: currentWeatherJson },
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
}

// Predictions endpoint
app.get('/predictions', async (request, reply) => {
  try {
    if (!currentWeatherJson) {
      return reply.status(400).send({
        error:
          'Current weather data is not available. Please fetch current conditions first.',
      });
    }

    console.log('Fetching predictions with stored weather data...');
    const predictions = await getAIPredictions(currentWeatherJson);
    return reply.send(JSON.parse(predictions));
  } catch (error: any) {
    console.error('Error fetching predictions:', error);
    return reply.status(500).send({
      error: 'Failed to fetch predictions',
      details: error.message,
    });
  }
});

const start = async () => {
  try {
    await app.listen({ port: 3000 });
    console.log('Server is running at http://localhost:3000');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
