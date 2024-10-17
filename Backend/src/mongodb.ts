import { FastifyInstance } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { MongoClient, Db } from 'mongodb';

declare module 'fastify' {
  interface FastifyInstance {
    mongo: {
      db: Db;
    };
  }
}

async function mongodbConnector(fastify: FastifyInstance) {
  const url =
    'mongodb+srv://zzzadmin:WNctxToxlfY9Ap3Y@csc3104-cloud-and-distr.g4es7.mongodb.net/?retryWrites=true&w=majority&appName=CSC3104-Cloud-And-Distributed-Computing-Project'; // Your MongoDB URI here'
  const client = new MongoClient(url);

  try {
    await client.connect();
    fastify.log.info('MongoDB connected successfully');

    const db = client.db('your-database-name'); // Replace with your actual database name
    fastify.decorate('mongo', { db });

    fastify.addHook('onClose', async () => {
      await client.close();
    });
  } catch (err) {
    fastify.log.error('MongoDB connection failed:', err);
  }
}

export const mongodbConnectorPlugin = fastifyPlugin(mongodbConnector);
