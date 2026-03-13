import { MongoClient, ObjectId } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { loadEnv } from "./config";

const env = loadEnv();

let cachedClient: MongoClient | null = null;
let memoryServer: MongoMemoryServer | null = null;
const MEMORY_SERVER_DISTRO = "ubuntu-22.04";

async function connect(uri: string) {
  const client = new MongoClient(uri);
  await client.connect();
  return client;
}

async function startMemoryServer() {
  if (!memoryServer) {
    if (!process.env.MONGOMS_DISTRO) {
      process.env.MONGOMS_DISTRO = MEMORY_SERVER_DISTRO;
    }
    memoryServer = await MongoMemoryServer.create();
  }

  const uri = memoryServer.getUri();
  return connect(uri);
}

export async function getMongoClient(): Promise<MongoClient> {
  if (cachedClient) {
    return cachedClient;
  }

  try {
    cachedClient = await connect(env.MONGO_URI);
  } catch (error) {
    if (env.NODE_ENV === "production") {
      throw error;
    }

    console.warn("mongo connection failed, falling back to in-memory server", error);
    cachedClient = await startMemoryServer();
  }

  return cachedClient;
}

export async function getDb() {
  const client = await getMongoClient();
  return client.db();
}

export { ObjectId };
