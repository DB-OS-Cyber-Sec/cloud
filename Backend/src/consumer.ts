import {
  webAppConsumer,
  aiConsumer,
  notificationConsumer,
  emailConsumer,
} from './kafka';
import { FastifyReply } from 'fastify';
import { sendEmail } from './email';
import * as db from './mongodb';

let isWeatherConsumerRunning = false;
let isTyphoonConsumerRunning = false;
let isForecastConsumerRunning = false;

// Consume Weather Updates
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

    if (!isWeatherConsumerRunning) {
      // Ensure the Kafka consumer is only started once
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

      isWeatherConsumerRunning = true;
    }

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

// Consume Typhoon Updates
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

    if (!isTyphoonConsumerRunning) {
      // Ensure the Kafka consumer is only started once
      await notificationConsumer.run({
        eachMessage: async ({ message }) => {
          const messageValue = message.value?.toString();
          if (messageValue) {
            console.log(`Consumed message: ${messageValue}`);

            // Send the consumed message to all connected clients
            for (const client of clients) {
              try {
                console.log(
                  'Sending message to client (typhoon-updates):',
                  messageValue
                );
                client.raw.write(`data: ${messageValue}\n\n`);
              } catch (error) {
                console.error('Error sending message to client:', error);
              }
            }
          }
        },
      });
      await emailConsumer.run({
        eachMessage: async ({ message }) => {
          const messageValue = message.value?.toString();
          if (messageValue) {
            console.log(`Consumed message: ${messageValue}`);

            // Send email to subscribers
            try {
              const subscribers = await db.Subscriber.find().lean();
              console.log(
                `Found ${subscribers.length} subscribers. Sending emails...`
              );

              for (let subscriber of subscribers) {
                try {
                  await sendEmail(messageValue, subscriber.email);
                  console.log(`Email sent to: ${subscriber.email}`);
                } catch (error) {
                  console.error(
                    `Failed to send email to ${subscriber.email}:`,
                    error
                  );
                }
              }
            } catch (dbError) {
              console.error(
                'Failed to fetch subscribers or send emails:',
                dbError
              );
            }
          }
        },
      });

      isTyphoonConsumerRunning = true;
    }

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

// Consume Weather Forecast
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

    if (!isForecastConsumerRunning) {
      // Ensure the Kafka consumer is only started once
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

      isForecastConsumerRunning = true;
    }

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
