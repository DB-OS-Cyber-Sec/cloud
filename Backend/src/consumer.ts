import { webAppConsumer, aiConsumer } from './kafka';
import { FastifyReply } from 'fastify';
import { sendWeatherDataGRPC } from './ai';
import { produceAIPredictions } from './producer';

// Store connected clients for SSE
const clients = new Set<FastifyReply>();
export const consumeWeather = (reply: FastifyReply) => {
  try {
    console.log('Client connected to consume current weather from Kafka...');

    // Set SSE headers
    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.flushHeaders();

    // Add the current client to the set of connected clients
    clients.add(reply);

    // Keep-alive ping to keep the connection open
    const keepAliveInterval = setInterval(() => {
      reply.raw.write(': keep-alive\n\n'); // Sending a keep-alive message
    }, 20000);

    // Ensure the Kafka consumer is running and processing messages
    webAppConsumer.run({
      eachMessage: async ({ message }) => {
        const messageValue = message.value?.toString();
        if (messageValue) {
          console.log(`Consumed message: ${messageValue}`);
          // Send the consumed message to all connected clients
          for (const client of clients) {
            try {
              client.raw.write(`data: ${messageValue}\n\n`);
            } catch (error) {
              console.error('Error sending message to client:', error);
            }
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

  clients.add({
    raw: { write: (message: string) => console.log(message) },
  } as FastifyReply);

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
