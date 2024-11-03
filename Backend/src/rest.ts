import { FastifyInstance } from 'fastify';
import * as db from './mongodb';
import { getWeather } from './producer';
import { getCurrentConditionsAI } from './environment';
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

  fastify.get('/getCurrentAI', async (request, reply) => {
    try {
      const currentAI = await getCurrentConditionsAI();
      reply.send(currentAI);
    } catch (err) {
      reply.code(500).send({
        error: 'Failed to fetch AI data',
        details: (err as Error).message,
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
    const { phoneNumber } = request.body as { phoneNumber: string }; // Expecting a single phone number

    const subscriber = new db.Subscriber({ phoneNumber }); // Save phone number directly

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
    const { phoneNumber } = request.body as { phoneNumber: string }; // Expecting the phone number in the request body

    try {
      const result = await db.Subscriber.findOneAndDelete({ phoneNumber }); // Find and delete directly by phone number
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
      const phoneNumbers = subscribers.map(
        (subscriber) => subscriber.phoneNumber
      );

      // Wrap the array in an object
      reply.send({ phoneNumbers }); // Send an object with phoneNumbers key
    } catch (err) {
      reply.code(500).send({
        error: 'Failed to fetch subscribers',
        details: (err as Error).message,
      });
    }
  });
};
