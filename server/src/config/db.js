import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure server/.env is loaded if not already loaded into process.env
if (!process.env.MONGO_URI) {
  dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
  if (!process.env.MONGO_URI) {
    dotenv.config({ path: path.resolve(__dirname, '../../.env') });
  }
}

/**
 * Masks sensitive credentials in MongoDB connection URI for safe console logging.
 */
export const maskMongoUri = (uri) => {
  if (!uri) return 'undefined';
  return uri.replace(/\/\/(.*?):(.*?)@/, '//$1:*****@');
};

/**
 * Connects to MongoDB Atlas cluster with enterprise-grade pool options and diagnostics.
 */
const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error(`\n--------------------------------------------------------------`);
    console.error(`[Database Error] MONGO_URI is not defined in server/.env!`);
    console.error(`To use MongoDB Atlas, configure MONGO_URI in server/.env:`);
    console.error(`MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/itam?retryWrites=true&w=majority`);
    console.error(`--------------------------------------------------------------\n`);
    return null;
  }

  // Detect unreplaced placeholder credentials
  if (mongoUri.includes('<username>') || mongoUri.includes('<password>') || mongoUri.includes('<cluster>')) {
    console.error(`\n--------------------------------------------------------------`);
    console.error(`[Database Error] MongoDB Atlas placeholder credentials detected!`);
    console.error(`Please open server/.env and replace <username>, <password>, and <cluster>`);
    console.error(`with your actual MongoDB Atlas cluster credentials.`);
    console.error(`--------------------------------------------------------------\n`);
    return null;
  }

  const isAtlas = mongoUri.startsWith('mongodb+srv://') || mongoUri.includes('mongodb.net');

  // Register connection lifecycle listeners once
  if (mongoose.connection.listenerCount('disconnected') === 0) {
    mongoose.connection.on('disconnected', () => {
      console.warn('[Database Warning] MongoDB connection disconnected. Attempting reconnection...');
    });
    mongoose.connection.on('reconnected', () => {
      console.log('[Database] MongoDB connection re-established.');
    });
    mongoose.connection.on('error', (err) => {
      console.error('[Database Error] Mongoose runtime error:', err.message);
    });
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000, // 15 seconds timeout for Atlas cluster discovery
      socketTimeoutMS: 45000,          // Close idle sockets after 45 seconds
      maxPoolSize: 25,                 // Connection pool size for concurrent API requests
      minPoolSize: 5,                  // Maintain baseline warm connections
      heartbeatFrequencyMS: 10000,     // Ping cluster health every 10 seconds
    });

    console.log(`[Database] Connected successfully to ${isAtlas ? 'MongoDB Atlas (Cloud)' : 'MongoDB'}`);
    console.log(`[Database] Target Host: ${conn.connection.host}`);
    console.log(`[Database] Active Database: ${conn.connection.name}`);
    console.log(`[Database] Endpoint URI: ${maskMongoUri(mongoUri)}`);
    return conn;
  } catch (error) {
    console.error(`\n--------------------------------------------------------------`);
    console.error(`[Database Error] Could not connect to MongoDB Atlas!`);
    console.error(`Endpoint: ${maskMongoUri(mongoUri)}`);
    console.error(`Reason:   ${error.message}`);
    console.error(`\nTroubleshooting MongoDB Atlas Connections:`);
    console.error(`1. Network Access (IP Whitelist):`);
    console.error(`   - Go to MongoDB Atlas > Network Access`);
    console.error(`   - Ensure your current public IP is whitelisted, or add 0.0.0.0/0 (allow all) for development.`);
    console.error(`2. Database Access (User Credentials):`);
    console.error(`   - Go to MongoDB Atlas > Database Access`);
    console.error(`   - Verify the username and password match server/.env.`);
    console.error(`   - If your password contains special characters (@, :, /, #), ensure they are URL-encoded.`);
    console.error(`3. Database Name in Connection String:`);
    console.error(`   - Make sure your URI includes the database name before query parameters:`);
    console.error(`     ...mongodb.net/itam?retryWrites=true&w=majority`);
    console.error(`--------------------------------------------------------------\n`);

    return null;
  }
};

export default connectDB;

