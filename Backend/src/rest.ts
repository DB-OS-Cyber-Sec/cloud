import { FastifyInstance } from 'fastify';
import * as db from './mongodb';
import { getWeather } from './producer';
import { getCurrentConditionsAI } from './environment';
import axios from 'axios';
import { flaskUrl, sendWeatherDataGRPC } from './ai';

export const restAPIHandler = (fastify: FastifyInstance) => {
  // Check Fastify running
  fastify.get('/health', async (request, reply) => {
    reply.send('Server is healthy');
  });

  // Test MongoDB connection
  fastify.get('/test-mongo', async (request, reply) => {
    try {
      const collections = await fastify.mongo.db.listCollections();
      reply.send({ success: true, collections });
    } catch (err) {
      reply.code(500).send({ success: false, error: (err as Error).message });
    }
  });

  fastify.get('/getWeather', async (request, reply) => {
    try {
      const weather = await getWeather();
      reply.send(weather);
    } catch (err) {
      reply.code(500).send({
        error: 'Failed to fetch weather data',
        details: (err as Error).message,
      });
    }
  });

  fastify.get('/test-sendAI', async (request, reply) => {
    try {
      const response = await getCurrentConditionsAI();
      // Extract relevant data and format it
      const hourly = response.data.timelines;
      const currentWeatherJson = JSON.stringify(hourly);
      return await sendWeatherDataGRPC(currentWeatherJson);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      return reply
        .status(500)
        .send({ error: 'Failed to fetch current conditions' });
    }
  });

  fastify.get('/flask-health', async (request, reply) => {
    try {
      const response = await axios.get(`${flaskUrl}/health`);
      return reply.send(response.data);
    } catch (error: any) {
      console.error(
        'Flask health check error:',
        error.response?.data || error.message
      );
      return reply.status(500).send({
        error: 'Failed to check Flask server health',
        details: error.message,
      });
    }
  });

  // Route to get all historical data
  fastify.get('/getHistoricalData', async (request, reply) => {
    try {
      const bulletins = await db.getHistoricalData();
      reply.send(bulletins);
    } catch (err) {
      reply.code(500).send({
        error: 'Failed to fetch historical data',
        details: (err as Error).message,
      });
    }
  });

  fastify.get('/getForecast', async (request, reply) => {});

  // POST /newSubscriber
  fastify.post('/newSubscriber', async (request, reply) => {
    const { email } = request.body as { email: string }; // Expecting a single phone number

    const subscriber = new db.Subscriber({ email }); // Save phone number directly

    try {
      await subscriber.save();
      reply.code(201).send(subscriber);
    } catch (err) {
      reply.code(400).send({
        error: 'Failed to save subscriber',
        details: (err as Error).message,
      });
    }
  });

  // DELETE /delSubscriber
  fastify.delete('/delSubscriber', async (request, reply) => {
    const { email } = request.body as { email: string }; // Expecting the phone number in the request body

    try {
      const result = await db.Subscriber.findOneAndDelete({ email }); // Find and delete directly by phone number
      if (!result) {
        return reply.code(404).send({ error: 'Subscriber not found' });
      }
      reply.send({ message: 'Subscriber deleted successfully' });
    } catch (err) {
      reply.code(500).send({
        error: 'Failed to delete subscriber',
        details: (err as Error).message,
      });
    }
  });
  // GET /getSubscribers
  fastify.get('/getSubscribers', async (request, reply) => {
    try {
      const subscribers = await db.Subscriber.find().lean(); // Retrieve all subscribers

      // Extract phone numbers into a flat array
      const email = subscribers.map((subscriber) => subscriber.email);

      // Wrap the array in an object
      reply.send({ email }); // Send an object with email key
    } catch (err) {
      reply.code(500).send({
        error: 'Failed to fetch subscribers',
        details: (err as Error).message,
      });
    }
  });
};
