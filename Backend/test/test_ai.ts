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
const flaskUrl = 'http://localhost:5000'; // Flask server URL

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

// Test Flask health endpoint
app.get('/test/flask-health', async (request, reply) => {
  try {
    const response = await axios.get(`${flaskUrl}/health`);
    return reply.send(response.data);
  } catch (error: any) {
    console.error(
      'Flask health check error:',
      error.response?.data || error.message
    );
    return reply.status(500).send({
      error: 'Failed to check Flask server health',
      details: error.message,
    });
  }
});

// Flask predictions endpoint
// Flask predictions endpoint
app.get('/flask-predictions', async (request, reply) => {
  try {
    if (!currentWeatherJson) {
      return reply.status(400).send({
        error:
          'Current weather data is not available. Please fetch current conditions first.',
      });
    }

    console.log('Fetching predictions from Flask endpoint...');
    console.log('Current Weather JSON:', currentWeatherJson);

    const parsedWeatherData = JSON.parse(currentWeatherJson);
    const predictions = await getFlaskPredictions(parsedWeatherData);

    return reply.send(predictions);
  } catch (error: any) {
    console.error('Error fetching Flask predictions:', error);
    return reply.status(500).send({
      error: 'Failed to fetch Flask predictions',
      details: error.message,
    });
  }
});

// Function to get AI predictions via Flask endpoint
async function getFlaskPredictions(weatherData: any): Promise<any> {
  try {
    const response = await axios.post(
      `${flaskUrl}/api/weather/prediction`,
      weatherData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Flask API error:', error.response?.data || error.message);
    throw error;
  }
}

const start = async () => {
  try {
    await app.listen({ port: 3000 });
    console.log('Server is running at http://localhost:3000');
    console.log('Available test endpoints:');
    console.log('- GET /test/current_conditions : Fetch current weather data');
    console.log('- GET /test/flask-health : Check Flask server health');
    console.log('- GET /flask-predictions : Get predictions via Flask');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
