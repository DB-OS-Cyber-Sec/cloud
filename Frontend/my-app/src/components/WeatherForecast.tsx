import React, { useState, useEffect } from 'react';

type ForecastData = {
  temperature: number;
  temperatureApparent: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  windGust: number;
  precipitationProbability: number;
};

const WeatherForecast: React.FC = () => {
  const [data, setData] = useState<ForecastData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create an EventSource to listen to the weather forecast stream
    const eventSource = new EventSource(
      'http://localhost:3010/weather-forecast'
    );

    // Listen for incoming messages from the server
    eventSource.onmessage = (event) => {
      try {
        console.log('Received weather forecast data:', event.data);
        const parsedData = JSON.parse(event.data);

        // Parse data and remove units
        const cleanData: ForecastData = {
          temperature: parseFloat(
            parsedData.one_hour_forecast.temperature?.replace('°C', '') || '0'
          ),
          temperatureApparent: parseFloat(
            parsedData.one_hour_forecast.temperature_apparent?.replace(
              '°C',
              ''
            ) || '0'
          ),
          humidity: parseFloat(
            parsedData.one_hour_forecast.humidity?.replace('%', '') || '0'
          ),
          windSpeed: parseFloat(
            parsedData.one_hour_forecast.wind_speed?.replace(' km/h', '') || '0'
          ),
          windDirection: parseFloat(
            parsedData.one_hour_forecast.wind_direction?.replace('°', '') || '0'
          ),
          windGust: parseFloat(
            parsedData.one_hour_forecast.wind_gust?.replace(' km/h', '') || '0'
          ),
          precipitationProbability: parseFloat(
            parsedData.one_hour_forecast.precipitation_probability?.replace(
              '%',
              ''
            ) || '0'
          ),
        };

        setData(cleanData);
      } catch (error) {
        console.log('Error parsing weather forecast data:', error);
        setError('Error parsing weather forecast data.');
      }
    };

    // Handle any error from the EventSource
    eventSource.onerror = (error) => {
      console.log('EventSource failed:', error);
      setError('Failed to connect to weather forecast stream.');
      eventSource.close(); // Close the EventSource on error
    };

    // Clean up the EventSource connection on component unmount
    return () => {
      eventSource.close();
    };
  }, []);

  if (error) return <p>{error}</p>;
  if (!data)
    return (
      <p>
        Press the &quot;Simulate API Call&quot; button to get forecast weather
        data
      </p>
    );

  return (
    <div>
      <p>Temperature: {data.temperature}°C</p>
      <p>Feels Like: {data.temperatureApparent}°C</p>
      <p>Humidity: {data.humidity}%</p>
      <p>Wind Speed: {data.windSpeed} km/h</p>
      <p>Wind Direction: {data.windDirection}°</p>
      <p>Wind Gust: {data.windGust} km/h</p>
      <p>Precipitation Probability: {data.precipitationProbability}%</p>
    </div>
  );
};

export default WeatherForecast;
