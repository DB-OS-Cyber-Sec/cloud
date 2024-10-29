import fastify from "fastify";
// import { environmentHandler, getCurrentConditions } from "./environment";
import axios from "axios";
// import { FastifyInstance } from "fastify";

const app = fastify({ logger: true });

// Set up API key and endpoint
const apiKey = "ZGEA8P4Sp7IS7hdJYvTZlKj6T1uJqdZ4";
const apiUrl = "https://api.tomorrow.io/v4/weather/forecast";

// Manila, Philipines coordinates
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
      
        timesteps: ["1h"], // Using '1h' for hourly data (can also use 'current' for the latest data)
        units: "metric",
      },
    });

    console.log("Full response data:", response.data);
    console.log("Current weather conditions:", response.data.timelines.minutely);
  } catch (err) {
    console.error("Error fetching weather data:", err);
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
