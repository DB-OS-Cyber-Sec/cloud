import { randomUUID } from 'crypto';
import fastify, { FastifyInstance } from 'fastify';
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'fastify-kafka-client',
  brokers: ['kafka-broker:9092'], // Use Docker service name or correct broker URL
});
const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'fastify-group' });
export async function kafkaConnector(fastify: FastifyInstance) {
  await producer.connect();
  await consumer.connect();

  fastify.decorate('kafka', { producer, consumer });
}

export const kafkaProducerHandler = (fastify: FastifyInstance) => {
  fastify.post('/produce', async (request, reply) => {
    const { message } = request.query as { message: string };

    try {
      // Connect the producer
      await producer.connect();

      // Send message to 'test-topic'
      await producer.send({
        topic: 'test-topic',
        messages: [
          { value: message }, // The message value must be a string or a buffer
        ],
      });

      await producer.disconnect();
      reply.send({ success: true, message: `Message sent: ${message}` });
    } catch (err) {
      fastify.log.error('Failed to send message:', err);
      reply
        .code(500)
        .send({ success: false, message: 'Failed to send message' });
    }
  });
};

export const kafkaConsumerHandler = (fastify: FastifyInstance) => {
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
};
