import { FastifyInstance } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import mongoose, { Connection } from 'mongoose';
declare module 'fastify' {
  interface FastifyInstance {
    mongo: {
      db: Connection; // Use Connection type from Mongoose
    };
  }
}

// MongoDB Connector Plugin using Mongoose
async function mongodbConnector(fastify: FastifyInstance) {
  const url =
    'mongodb+srv://zzzadmin:WNctxToxlfY9Ap3Y@csc3104-cloud-and-distr.g4es7.mongodb.net/weatherPredictionDB?retryWrites=true&w=majority&appName=CSC3104-Cloud-And-Distributed-Computing-Project';
  try {
    // Attempt to connect to MongoDB using Mongoose
    await mongoose.connect(url);
    fastify.log.info('MongoDB connected successfully');

    const db = mongoose.connection; // Get the Mongoose connection
    fastify.decorate('mongo', { db });

    // Check if the connection is working by listing collections
    if (db.db) {
      const collections = await db.db.listCollections().toArray();
      fastify.log.info('Collections:', collections);
    } else {
      fastify.log.warn('Unable to list collections, db.db is undefined');
    }

    // Clean up the connection when Fastify closes
    fastify.addHook('onClose', async () => {
      await mongoose.disconnect();
      fastify.log.info('MongoDB connection closed');
    });
  } catch (err) {
    if (err instanceof Error) {
      fastify.log.error('MongoDB connection failed:', err.message);
    } else {
      fastify.log.error('MongoDB connection failed:', err);
    }
    throw new Error('Failed to connect to the database'); // Propagate the error if needed
  }
}

export const mongodbConnectorPlugin = fastifyPlugin(mongodbConnector);

// Mongoose Schema and Models
// Mongoose Tropical Cyclone Bulletin Schema
const TropicalCycloneBulletinSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, // Ensures the title is provided
  },
  issued: {
    type: Date,
    required: true, // Ensures the issued date is provided
    default: Date.now, // Default to the current date
  },
  name: {
    type: String,
    required: true, // Ensures the name is provided
  },
  internationalName: {
    type: String,
    required: true, // Ensures the international name is provided
  },
  movement: {
    type: String,
    required: true, // Ensures movement description is provided
  },
  category: {
    type: Map, // Allows dynamic keys
    of: [String], // Each key maps to an array of strings
    required: true, // Ensures category is provided
  },
});

// Mongoose Subscriber Schema
const SubscriberSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true, // Ensure this field is provided
  },
});

// Mongoose Models
export const TropicalCycloneBulletin = mongoose.model(
  'TropicalCycloneBulletin', // Model name
  TropicalCycloneBulletinSchema,
  'typhoonHistoricalSet' // Explicit collection name
);
export const Subscriber = mongoose.model('Subscriber', SubscriberSchema);

// Function to get historical data with optimizations
export const getHistoricalData = async () => {
  try {
    console.log('Fetching historical data...');
    // Fetch all historical data
    const bulletins = await TropicalCycloneBulletin.find();
    console.log('Fetched historical data:', bulletins);

    if (!bulletins.length) {
      console.warn('No bulletins found for the specified query parameters.');
    }
    return bulletins;
  } catch (err) {
    // Log the error details for debugging
    console.error('Error fetching historical data:', err);
    throw new Error('Failed to fetch historical data');
  }
};
