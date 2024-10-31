// WeatherComponent.tsx
import React, { useState, useEffect } from "react";

function WeatherComponent() {
  const [weather, setWeather] = useState<{
    temperature: number;
    temperatureApparent: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    windGust: number;
    precipitationProbability: number;
  } | null>(null);

  useEffect(() => {
    // Simulate fetching JSON data
    const weatherData = {
      data: [
        {
          values: {
            temperature: 26.0,
            temperatureApparent: 28.5,
            humidity: 90,
            windSpeed: 25.0,
            windDirection: 310,
            windGust: 50.0,
            precipitationProbability: 30,
          },
        },
      ],
    };

    // Set the weather data to the first entry
    setWeather(weatherData.data[0].values);
  }, []);

  if (!weather) return <p>Loading...</p>;

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


// For when Data pipeline is ready
// import React, { useState, useEffect } from "react";

// interface WeatherData {
//   temperature: number;
//   temperatureApparent: number;
//   humidity: number;
//   windSpeed: number;
//   windDirection: number;
//   windGust: number;
//   precipitationProbability: number;
// }

// function WeatherComponent() {
//   const [weather, setWeather] = useState<WeatherData | null>(null);

//   useEffect(() => {
//     const fetchWeatherData = async () => {
//       try {
//         // Replace 'YOUR_API_URL' with the actual API endpoint
//         const response = await fetch("YOUR_API_URL");

//         if (!response.ok) {
//           throw new Error("Network response was not ok");
//         }

//         const data = await response.json();

//         // Assuming data structure based on provided JSON example
//         const weatherValues = data.data[0].values;

//         setWeather({
//           temperature: weatherValues.temperature,
//           temperatureApparent: weatherValues.temperatureApparent,
//           humidity: weatherValues.humidity,
//           windSpeed: weatherValues.windSpeed,
//           windDirection: weatherValues.windDirection,
//           windGust: weatherValues.windGust,
//           precipitationProbability: weatherValues.precipitationProbability,
//         });
//       } catch (error) {
//         console.error("Error fetching weather data:", error);
//       }
//     };

//     fetchWeatherData();
//   }, []);

//   if (!weather) return <p>Loading...</p>;

//   return (
//     <div>
//       <h2>Weather Information</h2>
//       <p>Temperature: {weather.temperature}°C</p>
//       <p>Feels Like: {weather.temperatureApparent}°C</p>
//       <p>Humidity: {weather.humidity}%</p>
//       <p>Wind Speed: {weather.windSpeed} km/h</p>
//       <p>Wind Direction: {weather.windDirection}°</p>
//       <p>Wind Gust: {weather.windGust} km/h</p>
//       <p>Precipitation Probability: {weather.precipitationProbability}%</p>
//     </div>
//   );
// }

// export default WeatherComponent;

