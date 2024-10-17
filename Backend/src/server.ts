import Fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify';
import { Kafka } from 'kafkajs';

// Create a Fastify instance
const fastify: FastifyInstance = Fastify({ logger: true });

// KafkaJS configuration
const kafka = new Kafka({
  clientId: 'fastify-kafka-client',
  brokers: ['kafka-broker:9092'], // Update this to use the Docker service name
});
// Create Kafka producer and consumer
const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'fastify-group' });

// Define Fastify route to produce a message to Kafka
interface IQuerystring {
  message: string;
}

const produceOpts: RouteShorthandOptions = {
  schema: {
    querystring: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
      required: ['message'],
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
        },
      },
    },
  },
};

fastify.post<{ Querystring: IQuerystring }>(
  '/produce',
  produceOpts,
  async (request, reply) => {
    const { message } = request.query;

    try {
      await producer.connect();
      await producer.send({
        topic: 'test-topic',
        messages: [{ value: message }],
      });
      await producer.disconnect();
      reply.send({ success: true, message: `Message sent: ${message}` });
    } catch (err) {
      fastify.log.error('Error producing message:', err);
      reply
        .code(500)
        .send({ success: false, message: 'Failed to produce message' });
    }
  }
);

// Define Fastify route to consume messages from Kafka
fastify.get('/consume', async (request, reply) => {
  const messages: string[] = [];

  try {
    await consumer.connect();
    await consumer.subscribe({ topic: 'test-topic', fromBeginning: true });

    await new Promise<void>((resolve, reject) => {
      // Start consuming messages
      consumer
        .run({
          eachMessage: async ({ message }) => {
            const messageValue = message.value?.toString();
            if (messageValue) {
              messages.push(messageValue);
              fastify.log.info(`Consumed message: ${messageValue}`);
            }
          },
        })
        .then(() => {
          resolve();
        })
        .catch((err) => {
          reject(err);
        });

      // Stop the consumer after a certain period to simulate consuming messages for a short time
      setTimeout(async () => {
        await consumer.disconnect();
        resolve(); // Resolves the promise to send the response
      }, 5000);
    });

    // Send the response once messages have been consumed or after the timeout
    reply.send({ success: true, messages });
  } catch (err) {
    fastify.log.error('Error consuming message:', err);
    reply.code(500).send({ success: false, messages: [] });
  }
});

// Start Fastify server
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' }); // Bind to 0.0.0.0
    fastify.log.info(`Server running on port 3000`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
