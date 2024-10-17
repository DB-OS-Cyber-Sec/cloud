// server.ts
import Fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify';
import { mongodbConnectorPlugin } from './mongodb'; // MongoDB connector
import {
  kafkaConnector,
  kafkaConsumerHandler,
  kafkaProducerHandler,
} from './kafka'; // Kafka connector

const fastify: FastifyInstance = Fastify({ logger: true });

// Register MongoDB and Kafka connectors
fastify.register(mongodbConnectorPlugin);
fastify.register(kafkaConnector);

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

// Kafka Producer Routes
kafkaProducerHandler(fastify);

// Kafka Consumer Routes
kafkaConsumerHandler(fastify);

// Start Fastify server
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    fastify.log.info(`Server running on port 3000 at 0.0.0.0`);
  } catch (err) {
    fastify.log.error(err);
  }
};
start();
