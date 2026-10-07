import mongoose from 'mongoose';

export async function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not defined');
  }

  return mongoose.connect(uri);
}

export default mongoose;
