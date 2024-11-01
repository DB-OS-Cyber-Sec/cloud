import { FastifyInstance } from 'fastify';

export const restAPIHandler = (fastify: FastifyInstance) => {
  // Check Fastify running
  fastify.get('/health', async (request, reply) => {
    reply.send('Server is healthy');
  });

  // Test MongoDB connection
  fastify.get('/test-mongo', async (request, reply) => {
    try {
      const collections = await fastify.mongo.db.listCollections().toArray();
      reply.send({ success: true, collections });
    } catch (err) {
      reply.code(500).send({ success: false, error: (err as Error).message });
    }
  });

  fastify.get('/getHistoricalData', async (request, reply) => {});

  fastify.get('/getForecast', async (request, reply) => {});

  fastify.post('/newSubscriber', async (request, reply) => {});

  fastify.put('/editSubscriber', async (request, reply) => {});

  fastify.delete('/delSubscriber', async (request, reply) => {});
};
