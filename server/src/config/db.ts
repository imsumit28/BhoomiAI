import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer | null = null;

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (uri && uri !== 'mongodb://localhost:27017/bhoomi_setu_ai') {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
      console.log(' Connected to configured MongoDB:', uri);
      return;
    } catch (err: any) {
      console.warn('⚠️ Could not connect to remote MongoDB URI. Falling back to in-memory MongoDB...', err.message);
    }
  }

  // Try connecting to local MongoDB first if present
  try {
    const localUri = uri || 'mongodb://127.0.0.1:27017/bhoomi_setu_ai';
    await mongoose.connect(localUri, { serverSelectionTimeoutMS: 2000 });
    console.log(' Connected to local MongoDB instance:', localUri);
  } catch {
    console.log(' Starting in-memory MongoDB server for zero-config demonstration...');
    mongod = await MongoMemoryServer.create();
    const memoryUri = mongod.getUri();
    await mongoose.connect(memoryUri);
    console.log(' Connected to In-Memory MongoDB:', memoryUri);
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
}
