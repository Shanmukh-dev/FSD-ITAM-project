import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/itam';

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`\n--------------------------------------------------------------`);
    console.error(`[Database Error] Could not connect to MongoDB!`);
    console.error(`Reason: ${error.message}`);
    console.error(`\nHow to fix:`);
    console.error(`1. If using MongoDB Atlas (Cloud - Recommended):`);
    console.error(`   - Open server/.env`);
    console.error(`   - Set MONGO_URI to your Atlas connection string:`);
    console.error(`     MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/itam?retryWrites=true&w=majority`);
    console.error(`2. If using local MongoDB:`);
    console.error(`   - Ensure the MongoDB service is started on localhost:27017`);
    console.error(`--------------------------------------------------------------\n`);

    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

export default connectDB;
