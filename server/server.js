import 'dotenv/config';
import mongoose from 'mongoose';
import app from './src/app.js';
import connectDB from './src/config/db.js';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas and start HTTP server
connectDB().then((conn) => {
  if (!conn) {
    console.error('[Server Error] MongoDB Atlas connection failed. Server startup aborted.');
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(` IT Asset Management System API Server`);
    console.log(` Environment:  ${process.env.NODE_ENV || 'development'}`);
    console.log(` Listening on: http://localhost:${PORT}`);
    console.log(` Health check: http://localhost:${PORT}/api/health`);
    console.log(` Database:     MongoDB Atlas (${conn.connection.name || 'itam'})`);
    console.log(` Cluster Host: ${conn.connection.host}`);
    console.log(`=================================================`);
  });

  const gracefulShutdown = async (signal) => {
    console.log(`\n[Server] Received ${signal}. Closing HTTP server and Atlas connection...`);
    server.close(async () => {
      try {
        await mongoose.connection.close();
        console.log('[Database] MongoDB connection closed.');
        process.exit(0);
      } catch (err) {
        console.error('[Database Error] Error during connection close:', err.message);
        process.exit(1);
      }
    });
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
}).catch((err) => {
  console.error('[Server Fatal] Startup error:', err.message);
  process.exit(1);
});

