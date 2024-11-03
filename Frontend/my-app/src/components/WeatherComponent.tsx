'use client';
import React, { useState, useEffect } from 'react';

interface WeatherData {
  temperature: number;
  temperatureApparent: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  windGust: number;
  precipitationProbability: number;
}

function WeatherComponent() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // New loading state

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:3010/weather-stream');

    eventSource.onmessage = (event) => {
      try {
        console.log('Received weather data:', event.data);
        const data = JSON.parse(event.data);

        // Corrected path to access `values`
        const weatherValues = data.data.timelines[0].intervals[0].values;

        setWeather({
          temperature: weatherValues.temperature,
          temperatureApparent: weatherValues.temperatureApparent,
          humidity: weatherValues.humidity,
          windSpeed: weatherValues.windSpeed,
          windDirection: weatherValues.windDirection,
          windGust: weatherValues.windGust,
          precipitationProbability: weatherValues.precipitationProbability,
        });

        setLoading(false); // Set loading to false once data is received
      } catch (error) {
        console.log('Error parsing weather data:', error);
        setError('Error parsing weather data.');
        setLoading(false); // Stop loading on error
      }
    };

    eventSource.onerror = (error) => {
      console.log('EventSource failed:', error);
      setError('Failed to connect to weather data stream.');
      setLoading(false); // Stop loading on error
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  if (loading) return <p>Press the "Simulate API Call" button to get current weather data</p>; // Show loading message
  if (error) return <p>{error}</p>;

  return (
    <div>
      <p>Temperature: {weather.temperature}°C</p>
      <p>Feels Like: {weather.temperatureApparent}°C</p>
      <p>Humidity: {weather.humidity}%</p>
      <p>Wind Speed: {weather.windSpeed} km/h</p>
      <p>Wind Direction: {weather.windDirection}°</p>
      <p>Wind Gust: {weather.windGust} km/h</p>
      <p>Precipitation Probability: {weather.precipitationProbability}%</p>
    </div>
  );
}

export default WeatherComponent;
