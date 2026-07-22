import { Db, MongoClient } from "mongodb";
import { config } from "./config";

declare global {
  var __openDateMongo: Promise<MongoClient> | undefined;
  var __openDateIndexes: Promise<void> | undefined;
}

function createClient() {
  const client = new MongoClient(config.mongoUri, {
    maxPoolSize: 12,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 5000,
  });
  return client.connect();
}

export async function getDb(): Promise<Db> {
  const clientPromise = globalThis.__openDateMongo ?? createClient();
  globalThis.__openDateMongo = clientPromise;
  const client = await clientPromise;
  const db = client.db(config.mongoDatabase);
  await ensureIndexes(db);
  return db;
}

async function ensureIndexes(db: Db) {
  if (!globalThis.__openDateIndexes) {
    globalThis.__openDateIndexes = Promise.all([
      db.collection("users").createIndex({ email: 1 }, { unique: true }),
      db.collection("events").createIndex({ slug: 1 }, { unique: true }),
      db.collection("events").createIndex({ ownerId: 1, createdAt: -1 }),
      db.collection("notifications").createIndex({ ownerId: 1, createdAt: -1 }),
      db.collection("notifications").createIndex({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 365 }),
    ]).then(() => undefined);
  }
  await globalThis.__openDateIndexes;
}
