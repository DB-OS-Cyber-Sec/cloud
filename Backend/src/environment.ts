import axios from 'axios';

// Set up API key and endpoint
const apiKey = 'ZGEA8P4Sp7IS7hdJYvTZlKj6T1uJqdZ4';
// const apiKey = 'zR3Bo5Zez7Qt5oHSmJYwyG7zWhkRiMTK';
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
        fields: [
          'cloudBase', // cloud base
          'cloudCeiling', // cloud ceiling
          'cloudCover', // cloud cover
          'dewPoint', // dew point
          'freezingRainIntensity', // freezing rain intensity
          'humidity', // humidity
          'precipitationProbability', // precipitation probability
          'pressureSurfaceLevel', // pressure surface level
          'rainIntensity', // rain intensity
          'sleetIntensity', // sleet intensity
          'snowIntensity', // snow intensity
          'temperature', // temperature
          'temperatureApparent', // apparent temperature
          'uvHealthConcern', // UV health concern
          'uvIndex', // UV index
          'visibility', // visibility
          'weatherCode', // weather code
          'windDirection', // wind direction
          'windGust', // wind gust
          'windSpeed', // wind speed
        ],
        timesteps: '1h',
        units: 'metric',
        startTime: new Date().toISOString(), // Optional, defaults to current time if not provided
        endTime: new Date(new Date().getTime() + 3600 * 1000).toISOString(), // 1 hour from now
      },
    });

    return response.data;
  } catch (err) {
    console.error('Error fetching weather data:', err);
  }
}
