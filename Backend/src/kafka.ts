import { FastifyInstance } from 'fastify';
import { Kafka } from 'kafkajs';
import * as producerModule from './producer';
import * as consumerModule from './consumer';

const kafka = new Kafka({
  clientId: 'fastify-kafka-client',
  brokers: ['kafka-broker:9092'], // Use Docker service name or correct broker URL
});
export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: 'fastify-group' });

export async function kafkaConnector(fastify: FastifyInstance) {
  await producer.connect();
  await consumer.connect();

  // Decorate Fastify instance with Kafka producer and consumer
  fastify.decorate('kafka', { producer, consumer });

  // Subscribe to the 'current-weather' topic once during startup
  await consumer.subscribe({ topic: 'current-weather', fromBeginning: true });
}

export const kafkaProducerHandler = (fastify: FastifyInstance) => {
  fastify.post('/produce', async (request, reply) => {
    const { message } = request.query as { message: string };

    try {
      // Send message to 'test-topic'
      await producer.send({
        topic: 'test-topic',
        messages: [
          { value: message }, // The message value must be a string or a buffer
        ],
      });

      reply.send({ success: true, message: `Message sent: ${message}` });
    } catch (err) {
      fastify.log.error('Failed to send message:', err);
      reply
        .code(500)
        .send({ success: false, message: 'Failed to send message' });
    }
  });

  fastify.post('/produce-current-weather', async (request, reply) => {
    try {
      await producerModule.getWeather();
      reply.send({ success: true, message: 'Current weather sent' });
    } catch (err) {
      fastify.log.error('Failed to send current weather:', err);
      reply
        .code(500)
        .send({ success: false, message: 'Failed to send current weather' });
    }
  });
};

export const kafkaConsumerHandler = (fastify: FastifyInstance) => {
  // SSE route for consuming weather data from Kafka
  fastify.get('/weather-stream', async (request, reply) => {
    await consumerModule.consumeWeather(reply); // Pass the reply object to handle SSE responses
  });
};
