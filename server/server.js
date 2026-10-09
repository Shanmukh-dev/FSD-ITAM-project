import 'dotenv/config';
import app from './src/app.js';
import connectDB from './src/config/db.js';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start HTTP server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(` IT Asset Management System API Server`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(` Listening on: http://localhost:${PORT}`);
    console.log(` Health check: http://localhost:${PORT}/api/health`);
    console.log(`=================================================`);
  });
});
