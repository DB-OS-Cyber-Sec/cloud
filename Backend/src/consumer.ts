import { webAppConsumer, aiConsumer } from './kafka';
import { FastifyReply } from 'fastify';
import { sendWeatherDataGRPC } from './ai';
import { produceAIPredictions } from './producer';

// Store connected clients for SSE
const clients = new Set<FastifyReply>();

export const consumeWeather = async (reply: FastifyReply) => {
  try {
    console.log('Client connected to consume current weather from Kafka...');

    // Set SSE headers
    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.flushHeaders();

    // Add the current client to the set of connected clients
    clients.add(reply);

    // This ensures that a ping is sent every 20 seconds to keep the connection alive.
    const keepAliveInterval = setInterval(() => {
      reply.raw.write(': keep-alive\n\n');
    }, 20000);

    // Kafka consumer should already be connected and subscribed during startup
    webAppConsumer.run({
      eachMessage: async ({ message }) => {
        const messageValue = message.value?.toString();
        if (messageValue) {
          console.log(`Consumed message: ${messageValue}`);
          // Send the consumed message to all connected clients
          for (const client of clients) {
            client.raw.write(`data: ${messageValue}\n\n`);
          }
        }
      },
    });

    // Handle client disconnection
    reply.raw.on('close', () => {
      console.log('Client disconnected from SSE');
      clearInterval(keepAliveInterval); // Stop the keep-alive pings
      clients.delete(reply); // Remove the client from the set
      reply.raw.end(); // Close the connection
    });
  } catch (err) {
    console.error('Failed to consume messages from Kafka:', err);
    reply
      .code(500)
      .send({ success: false, message: 'Failed to consume weather data' });
  }
};

// Consume AI predictions from Kafka
export const connectAndSubscribeAI = async () => {
  await aiConsumer.connect();
  console.log('AI consumer connected.');

  // Subscribe to the relevant topic for AI predictions
  await aiConsumer.subscribe({ topic: 'current-weather', fromBeginning: true });
  console.log('AI consumer subscribed to current-weather topic.');

  // Run the consumer
  await aiConsumer.run({
    eachMessage: async ({ message }) => {
      const messageValue = message.value?.toString();
      if (messageValue) {
        console.log(`AI Consumer consumed message: ${messageValue}`);

        // Send weather data to the AI service via gRPC
        const response = await sendWeatherDataGRPC(messageValue);
        // Produce the AI predictions to the 'ai-predictions' topic
        if (response) {
          await produceAIPredictions(response);
        }
      }
    },
  });
};
