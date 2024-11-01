// server.ts
import Fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify';
import { mongodbConnectorPlugin } from './mongodb'; // MongoDB connector
import {
  kafkaConnector,
  kafkaConsumerHandler,
  kafkaProducerHandler,
} from './kafka'; // Kafka connector
import { restAPIHandler } from './rest'; // REST API handler
import fastifySSE from 'fastify-sse-v2';

const server: FastifyInstance = Fastify({ logger: true });

// Register MongoDB and Kafka connectors
server.register(fastifySSE);
server.register(mongodbConnectorPlugin);
server.register(kafkaConnector);

// REST API Routes
restAPIHandler(server);

// Kafka Producer Routes
kafkaProducerHandler(server);

// Kafka Consumer Routes
kafkaConsumerHandler(server);

// Start Fastify server
const start = async () => {
  try {
    await kafkaConnector(server);
    await server.listen({ port: 3000, host: '0.0.0.0' });
    server.log.info(`Server running on port 3000 at 0.0.0.0`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();
