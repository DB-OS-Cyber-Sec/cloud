import React, { useState, useEffect } from "react";

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

  useEffect(() => {
    // Create an EventSource to listen to the server-sent events
    const eventSource = new EventSource("http://localhost:3010/weather-stream");

    // Listen for the incoming messages from the server
    eventSource.onmessage = (event) => {
      try {
        console.log("Received weather data:", event.data);
        const data = JSON.parse(event.data);
        
        // Assuming data structure based on your provided JSON example
        const weatherValues = data.data[0].values;

        setWeather({
          temperature: weatherValues.temperature,
          temperatureApparent: weatherValues.temperatureApparent,
          humidity: weatherValues.humidity,
          windSpeed: weatherValues.windSpeed,
          windDirection: weatherValues.windDirection,
          windGust: weatherValues.windGust,
          precipitationProbability: weatherValues.precipitationProbability,
        });
      } catch (error) {
        console.log("Error parsing weather data:", error);
        setError("Error parsing weather data.");
      }
    };

    // Handle any error from the EventSource
    eventSource.onerror = (error) => {
      console.log("EventSource failed:", error);
      setError("Failed to connect to weather data stream.");
      eventSource.close(); // Close the EventSource on error
    };

    // Clean up the EventSource connection on component unmount
    return () => {
      eventSource.close();
    };
  }, []);

  if (error) return <p>{error}</p>;
  if (!weather) return <p>Press the "Simulate API Call" button to get current weather data</p>;;

  return (
    <div className="bg-[#121C2D] text-white p-4 rounded-lg space-y-2">
      <h2 className="text-lg font-semibold">Current Weather</h2>
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
