import mongoose from "mongoose";
import {
  afterAll,
  afterEach,
  beforeAll,
} from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";

process.env.NODE_ENV = "test";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();

  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;

  for (const collection of Object.values(collections)) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();

  if (mongoServer) {
    await mongoServer.stop();
  }
});