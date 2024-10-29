import axios from 'axios';  // Make sure you have this imported
import fastify, { FastifyInstance } from 'fastify';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

const app = fastify({ logger: true });

// Load the protobuf
const PROTO_PATH = '../../proto/data.proto'; // Adjust the path to your .proto file
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const proto = grpc.loadPackageDefinition(packageDefinition) as any; // Type as needed

let currentWeatherJson = null as any;

// Set up API key and endpoint
const apiKey = 'ZGEA8P4Sp7IS7hdJYvTZlKj6T1uJqdZ4';
const apiUrl = 'https://api.tomorrow.io/v4/weather/forecast';

// Manila, Philippines coordinates
const location = {
  lat: 14.5995, // Latitude
  lon: 120.9842, // Longitude
};

// Route to test getCurrentConditions
app.get("/test/current_conditions", async (request, reply) => {
  try {
    const response = await axios.get(apiUrl, {
      params: {
        apikey: apiKey,
        location: `${location.lat},${location.lon}`,
        timesteps: "1m",
        units: "metric",
      },
    });

    // Extract and save the current weather conditions
    currentWeatherJson = JSON.stringify(response.data.timelines.minutely); // Convert to string
    console.log("Current weather conditions:", currentWeatherJson);
    reply.send(JSON.parse(currentWeatherJson)); // Send as JSON object
  } catch (err) {
    console.error("Error fetching weather data:", err);
    reply.status(500).send({ error: "Failed to fetch current conditions" });
  }
});

// New function to get AI predictions
async function getAIPredictions(currentWeatherJson: string) {
    const client = new proto.dataservice.DataService('localhost:50051', grpc.credentials.createInsecure(), {
      'grpc.max_receive_message_length': 50 * 1024 * 1024,  // 50 MB
      'grpc.max_send_message_length': 50 * 1024 * 1024       // 50 MB
  });

    return new Promise((resolve, reject) => {
        const request = { current_weather_json: currentWeatherJson };
        console.log("gRPC Request:", request);
        client.GetAIPredictionsData(request, (error: any, response: any) => {
            if (error) {
                reject(error);
            } else {
                resolve(response.ai_predictions_json); // Adjust based on the correct field names in response
            }
        });
    });
}

// New endpoint for predictions
app.get('/predictions', async (request, reply) => {
  try {
    if (!currentWeatherJson) {
      return reply.status(400).send({ error: "Current weather data is not available" });
    }

    // Call the gRPC service with the actual current weather JSON
    const predictions = await getAIPredictions(currentWeatherJson);
    reply.send(predictions);
  } catch (error) {
    console.error('Error fetching predictions:', error);
    reply.status(500).send({ error: 'Failed to fetch predictions' });
  }
});

const start = async () => {
  try {
    await app.listen({ port: 3000 });
    console.log("Server is running at http://localhost:3000");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
