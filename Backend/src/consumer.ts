import { consumer } from './kafka';
import { FastifyReply } from 'fastify';

export const consumeWeather = async (reply: FastifyReply) => {
  try {
    console.log('Consuming current weather from Kafka...');

    // Set SSE headers
    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.flushHeaders();

    // This ensures that a ping is sent every 20 seconds to keep the connection alive.
    const keepAliveInterval = setInterval(() => {
      reply.raw.write(': keep-alive\n\n');
    }, 20000);

    // Kafka consumer should already be connected and subscribed during startup
    consumer.run({
      eachMessage: async ({ message }) => {
        const messageValue = message.value?.toString();
        if (messageValue) {
          console.log(`Consumed message: ${messageValue}`);
          // Send the consumed message to the SSE stream
          reply.raw.write(`data: ${messageValue}\n\n`);
        }
      },
    });

    // Handle client disconnection
    reply.raw.on('close', () => {
      console.log('Client disconnected from SSE');
      clearInterval(keepAliveInterval); // Stop the keep-alive pings
      reply.raw.end();
    });
  } catch (err) {
    console.error('Failed to consume messages from Kafka:', err);
    reply
      .code(500)
      .send({ success: false, message: 'Failed to consume weather data' });
  }
};
