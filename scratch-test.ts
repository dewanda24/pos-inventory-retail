import dotenv from 'dotenv';
dotenv.config();

import { dbStore } from './src/db/store';

async function test() {
  console.log('Connecting to DB...', process.env.MONGODB_URI);
  await dbStore.connect();
  try {
    const user = await dbStore.findUserByUsername('owner');
    console.log('User:', user);
    if (user) {
      const valid = await dbStore.verifyPassword(user.id, 'password123');
      console.log('Valid:', valid);
    } else {
      console.log('User not found!');
    }
  } catch (err) {
    console.error('Error during find or verify:', err);
  } finally {
    process.exit(0);
  }
}

test();
