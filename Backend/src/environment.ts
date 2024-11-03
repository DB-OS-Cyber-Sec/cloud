import axios from 'axios';

// Set up API key and endpoint
const apiKey = 'ZGEA8P4Sp7IS7hdJYvTZlKj6T1uJqdZ4';
const apiUrl = 'https://api.tomorrow.io/v4/timelines';

// Manila, Philipines coordinates
const location = {
  lat: 14.5995, // Latitude
  lon: 120.9842, // Longitude
};

// Fetch current weather conditions
export async function getCurrentConditions() {
  try {
    const response = await axios.get(apiUrl, {
      params: {
        apikey: apiKey,
        location: `${location.lat},${location.lon}`,
        fields: [
          'temperature',
          'temperatureApparent',
          'humidity',
          'windSpeed',
          'windDirection',
          'windGust',
          'precipitationProbability',
        ],
        timesteps: '1h',
        units: 'metric',
        startTime: new Date().toISOString(), // Optional, defaults to current time if not provided
        endTime: new Date(new Date().getTime() + 3600 * 1000).toISOString(), // 1 hour from now
      },
    });

    console.log('Current weather conditions:', response.data);
    return response.data;
  } catch (err) {
    console.error('Error fetching weather data:', err);
  }
}

export async function getCurrentConditionsAI() {
  try {
    const response = await axios.get(apiUrl, {
      params: {
        apikey: apiKey,
        location: `${location.lat},${location.lon}`,

        timesteps: '1h',
        units: 'metric',
        startTime: new Date().toISOString(), // Optional, defaults to current time if not provided
        endTime: new Date(new Date().getTime() + 3600 * 1000).toISOString(), // 1 hour from now
      },
    });

    console.log('Current weather conditions:', response.data);
    return response.data;
  } catch (err) {
    console.error('Error fetching weather data:', err);
  }
}
