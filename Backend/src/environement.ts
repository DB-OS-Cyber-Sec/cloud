import axios from 'axios';
import { FastifyInstance } from 'fastify';

// Set up API key and endpoint
const apiKey = 'ZGEA8P4Sp7IS7hdJYvTZlKj6T1uJqdZ4';
const apiUrl = 'https://api.tomorrow.io/v4/timelines';

// Example coordinates
const location = {
  lat: 42.3601, // Latitude
  lon: -71.0589, // Longitude
};

// Fetch current weather conditions
async function getCurrentConditions() {
  try {
    const response = await axios.get(apiUrl, {
      params: {
        apikey: apiKey,
        location: `${location.lat},${location.lon}`,
        fields: ['temperature', 'precipitationType', 'windSpeed'],
        timesteps: '1h', // Using '1h' for hourly data (can also use 'current' for the latest data)
        units: 'metric',
        startTime: new Date().toISOString(), // Optional, defaults to current time if not provided
        endTime: new Date(new Date().getTime() + 3600 * 1000).toISOString(), // 1 hour from now
      },
    });

    console.log('Current weather conditions:', response.data);
  } catch (err) {
    console.error('Error fetching weather data:', err);
  }
}

export const environmentHandler = async (fastify: FastifyInstance) => {
  fastify.get('/current_conditions', async (request, reply) => {
    await getCurrentConditions();
  });
};
