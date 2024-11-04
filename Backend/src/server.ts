import fastifyStatic from '@fastify/static';
import cors from '@fastify/cors';
import Fastify, { FastifyInstance } from 'fastify';
import { mongodbConnectorPlugin } from './mongodb'; // MongoDB connector
import {
  kafkaConnector,
  kafkaConsumerHandler,
  kafkaProducerHandler,
} from './kafka'; // Kafka connector
import { restAPIHandler } from './rest'; // REST API handler
import fastifySSE from 'fastify-sse-v2';
import path from 'path';
import { startEmailListener } from './email';

const server: FastifyInstance = Fastify({ logger: true });

// Register CORS
server.register(cors, {
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Allow all methods
  allowedHeaders: ['*'], // Allow all headers
  credentials: true, // Allow credentials (like cookies)
});

// Register MongoDB and Kafka connectors
server.register(fastifySSE);
server.register(mongodbConnectorPlugin);
server.register(kafkaConnector);
server.register(fastifyStatic, {
  root: path.join(__dirname, 'test'),
  prefix: '/test/', // Optional: you can set a prefix for the static files
});

// Route to serve the HTML file
server.get('/test-web-stream', async (request, reply) => {
  try {
    await reply.sendFile('web-stream.html'); // Sends the file located at 'src/test/web-stream.html'
  } catch (err) {
    server.log.error(err);
    reply.code(500).send({ error: 'Failed to serve HTML file' });
  }
});

server.get('/test-typhoon-updates', async (request, reply) => {
  try {
    await reply.sendFile('typhoon-updates.html'); // Sends the file located at 'src/test/web-stream.html'
  } catch (err) {
    server.log.error(err);
    reply.code(500).send({ error: 'Failed to serve HTML file' });
  }
});

server.get('/test-weather-forecast', async (request, reply) => {
  try {
    await reply.sendFile('weather-forecast.html'); // Sends the file located at 'src/test/web-stream.html'
  } catch (err) {
    server.log.error(err);
    reply.code(500).send({ error: 'Failed to serve HTML file' });
  }
});

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
    startEmailListener();

    await server.listen({ port: 3010, host: '0.0.0.0' });
    server.log.info(`Server running on port 3010 at 0.0.0.0`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();
