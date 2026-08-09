import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function resetDb() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not set in .env');
    process.exit(1);
  }
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    const collections = await db.collections();
    for (let collection of collections) {
      await collection.drop();
      console.log('Dropped collection:', collection.collectionName);
    }
    console.log('? Database reset successfully! You can now restart your dev server or Vercel app to re-seed.');
  } catch (err) {
    console.error('Failed to reset DB', err);
  } finally {
    await client.close();
  }
}

resetDb();
