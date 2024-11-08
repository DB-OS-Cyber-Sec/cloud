import { FastifyInstance } from 'fastify';
import { Kafka } from 'kafkajs';
import * as producerModule from './producer';
import * as consumerModule from './consumer';

// Initialize Kafka
const kafka = new Kafka({
  clientId: 'fastify-kafka-client',
  brokers: ['kafka:9092'], // Updated to use the correct service name
});

export const weatherProducer = kafka.producer();
export const aiProducer = kafka.producer();
export const webAppConsumer = kafka.consumer({ groupId: 'web-app' });
export const aiConsumer = kafka.consumer({ groupId: 'ai' });
export const notificationConsumer = kafka.consumer({ groupId: 'notification' });
export const emailConsumer = kafka.consumer({ groupId: 'email' });

export async function kafkaConnector(fastify: FastifyInstance) {
  // Fetch metadata for all necessary topics
  try {
    const metadata = await kafka.admin().fetchTopicMetadata({
      topics: ['current-weather', 'weather-forecast', 'typhoon-updates'],
    });
    fastify.log.info('Fetched topic metadata:', metadata);
  } catch (err) {
    fastify.log.error('Failed to fetch topic metadata:', err);
  }
  // Connect to Kafka brokers
  await weatherProducer.connect();
  await aiProducer.connect();
  await webAppConsumer.connect();
  await aiConsumer.connect();
  await notificationConsumer.connect();
  await emailConsumer.connect();

  // Decorate Fastify instance with Kafka producer and consumer
  fastify.decorate('kafka', {
    weatherProducer,
    aiProducer,
    webAppConsumer,
    aiConsumer,
    notificationConsumer,
    emailConsumer,
  });

  // Subscribe to topics
  await webAppConsumer.subscribe({ topic: 'current-weather' });
  await aiConsumer.subscribe({ topic: 'weather-forecast' });
  await notificationConsumer.subscribe({ topic: 'typhoon-updates' });
}

export const kafkaProducerHandler = (fastify: FastifyInstance) => {
  fastify.post('/produce', async (request, reply) => {
    const { message } = request.query as { message: string };

    try {
      // Send message to 'test-topic'
      await weatherProducer.send({
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
    consumerModule.consumeWeather(reply); // Pass the reply object to handle SSE responses
  });

  // SSE route for consuming typhoon updates from Kafka
  fastify.get('/typhoon-stream', async (request, reply) => {
    consumerModule.consumeTyphoonUpdates(reply); // Pass the reply object to handle SSE responses
  });

  // SSE route for weather forecast
  fastify.get('/weather-forecast', async (request, reply) => {
    consumerModule.consumeForecast(reply);
  });

  // fastify.get('/email-typhoon-updates', async (request, reply) => {
  consumerModule.consumeTyphoonEmail();
  // });
};
