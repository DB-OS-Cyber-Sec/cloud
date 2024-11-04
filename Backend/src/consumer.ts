import { webAppConsumer, aiConsumer, notificationConsumer } from './kafka';
import { FastifyReply } from 'fastify';

export const consumeWeather = async (reply: FastifyReply) => {
  const clients = new Set<FastifyReply>();

  try {
    console.log('Client connected to consume current weather from Kafka...');

    // Set SSE headers
    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Access-Control-Allow-Origin', '*');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.flushHeaders();

    // Add the current client to the set of connected clients
    clients.add(reply);

    // Keep-alive ping to keep the connection open
    const keepAliveInterval = setInterval(() => {
      reply.raw.write(': keep-alive\n\n'); // Sending a keep-alive message
    }, 20000);

    // Ensure the Kafka consumer is running and processing messages
    await webAppConsumer.run({
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

export const consumeTyphoonUpdates = async (reply: FastifyReply) => {
  const clients = new Set<FastifyReply>();

  try {
    console.log('Client connected to consume typhoon updates from Kafka...');

    // Set SSE headers
    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Access-Control-Allow-Origin', '*');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.flushHeaders();

    // Add the current client to the set of connected clients
    clients.add(reply);

    // Keep-alive ping to keep the connection open
    const keepAliveInterval = setInterval(() => {
      reply.raw.write(': keep-alive\n\n'); // Sending a keep-alive message
    }, 20000);

    // Ensure the Kafka consumer is running and processing messages
    await notificationConsumer.run({
      eachMessage: async ({ message }) => {
        const messageValue = message.value?.toString();
        if (messageValue) {
          console.log(`Consumed message: ${messageValue}`);

          // Send the consumed message to all connected clients
          for (const client of clients) {
            try {
              console.log('Sending message to client:', messageValue);
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
      .send({ success: false, message: 'Failed to consume typhoon updates' });
  }
};
export const consumeForecast = async (reply: FastifyReply) => {
  const clients = new Set<FastifyReply>();

  try {
    console.log('Client connected to consume weather forecast from Kafka...');

    // Set SSE headers
    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Access-Control-Allow-Origin', '*');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.flushHeaders();

    // Add the current client to the set of connected clients
    clients.add(reply);

    // Keep-alive ping to keep the connection open
    const keepAliveInterval = setInterval(() => {
      reply.raw.write(': keep-alive\n\n'); // Sending a keep-alive message
    }, 20000);

    // Ensure the Kafka consumer is running and processing messages
    await aiConsumer.run({
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
      .send({ success: false, message: 'Failed to consume weather forecast' });
  }
};
