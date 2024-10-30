import React from "react";

type ForecastData = {
  temperature: number;
  temperatureApparent: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  windGust: number;
  precipitationProbability: number;
};

const sampleForecastData: ForecastData = {
  temperature: 25.0,
  temperatureApparent: 26.5,
  humidity: 85,
  windSpeed: 25.0,
  windDirection: 315,
  windGust: 50.0,
  precipitationProbability: 90,
};

const WeatherForecast: React.FC = () => {
  const data = sampleForecastData;

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

// For when Data pipeline is ready
// import React, { useState, useEffect } from "react";

// type ForecastData = {
//   temperature: number;
//   temperatureApparent: number;
//   humidity: number;
//   windSpeed: number;
//   windDirection: number;
//   windGust: number;
//   precipitationProbability: number;
// };

// const WeatherForecast: React.FC = () => {
//   const [data, setData] = useState<ForecastData | null>(null);

//   useEffect(() => {
//     // Replace with your actual API endpoint
//     const fetchWeatherData = async () => {
//       try {
//         const response = await fetch("https://api.example.com/weather-forecast");
//         const result = await response.json();

//         // Map API response to the required structure
//         const forecastData: ForecastData = {
//           temperature: result.temperature,
//           temperatureApparent: result.temperatureApparent,
//           humidity: result.humidity,
//           windSpeed: result.windSpeed,
//           windDirection: result.windDirection,
//           windGust: result.windGust,
//           precipitationProbability: result.precipitationProbability,
//         };

//         setData(forecastData);
//       } catch (error) {
//         console.error("Error fetching weather data:", error);
//       }
//     };

//     fetchWeatherData();
//   }, []);

//   if (!data) return <p>Loading...</p>;

//   return (
//     <div>
//       <h3>1-Hour Forecast</h3>
//       <p>Temperature: {data.temperature}°C</p>
//       <p>Feels Like: {data.temperatureApparent}°C</p>
//       <p>Humidity: {data.humidity}%</p>
//       <p>Wind Speed: {data.windSpeed} km/h</p>
//       <p>Wind Direction: {data.windDirection}°</p>
//       <p>Wind Gust: {data.windGust} km/h</p>
//       <p>Precipitation Probability: {data.precipitationProbability}%</p>
//     </div>
//   );
// };

// export default WeatherForecast;
