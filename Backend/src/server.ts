// server.ts
import Fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify';
import { mongodbConnectorPlugin } from './mongodb'; // MongoDB connector
import {
  kafkaConnector,
  kafkaConsumerHandler,
  kafkaProducerHandler,
} from './kafka'; // Kafka connector
import fastifySSE from 'fastify-sse-v2';

const server: FastifyInstance = Fastify({ logger: true });

// Register MongoDB and Kafka connectors
server.register(fastifySSE);
server.register(mongodbConnectorPlugin);
server.register(kafkaConnector);

// Check Fastify running
server.get('/health', async (request, reply) => {
  reply.send('Server is healthy');
});

// Test MongoDB connection
server.get('/test-mongo', async (request, reply) => {
  try {
    const collections = await server.mongo.db.listCollections().toArray();
    reply.send({ success: true, collections });
  } catch (err) {
    reply.code(500).send({ success: false, error: (err as Error).message });
  }
});

// Kafka Producer Routes
kafkaProducerHandler(server);

// Kafka Consumer Routes
kafkaConsumerHandler(server);

// Start Fastify server
const start = async () => {
  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
    server.log.info(`Server running on port 3000 at 0.0.0.0`);
  } catch (err) {
    server.log.error(err);
  }
};
start();
