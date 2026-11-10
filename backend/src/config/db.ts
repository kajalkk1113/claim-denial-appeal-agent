import mongoose from 'mongoose';

export async function connectDatabase(): Promise<void> {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI must be configured before starting the API.');
  }
  await mongoose.connect(uri);
  console.info('MongoDB connected.');
}
