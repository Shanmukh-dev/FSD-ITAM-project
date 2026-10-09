import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/itam';

export async function ensureTestAdmin() {
  try {
    const conn = await mongoose.connect(MONGO_URI);
    const usersCol = conn.connection.db.collection('users');

    const email = 'admin@enterprise.corp';
    const password = 'Password123!';

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await usersCol.updateOne(
      { email },
      {
        $set: {
          name: 'Primary Administrator',
          email,
          passwordHash,
          role: 'ADMIN',
          isActive: true,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    console.log('[Setup] Test Admin account verified (admin@enterprise.corp)');
    await mongoose.disconnect();
    return true;
  } catch (err) {
    console.warn('[Setup Warning] Could not ensure test admin via direct Mongo:', err.message);
    return false;
  }
}

if (process.argv[1] && process.argv[1].endsWith('ensure-test-env.js')) {
  ensureTestAdmin().then(() => process.exit(0));
}
