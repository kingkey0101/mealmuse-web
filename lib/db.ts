import { MongoClient, Db } from "mongodb";

// Strip quotes if present (e.g., from .env.local)
const uri = process.env.MONGODB_URI?.replace(/^['"]|['"]$/g, '');
const options = {};

// Extract database name from URI or use environment variable or default
function extractDbNameFromUri(uri: string): string {
  try {
    // Try to extract database name from MongoDB URI
    // Format: mongodb+srv://user:pass@host/DATABASE_NAME?options
    const match = uri.match(/\/([^/?]+)(\?|$)/);
    if (match && match[1]) {
      return match[1];
    }
  } catch (error) {
    console.warn("Could not extract database name from URI");
  }
  return "mealmuse_prod"; // fallback
}

const dbName = process.env.MONGODB_DB_NAME || (uri ? extractDbNameFromUri(uri) : "mealmuse_prod");

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  throw new Error("Please add MONGODB_URI to your .env.local");
}

// Validate URI format
if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
  throw new Error(`Invalid MongoDB URI format: ${uri.substring(0, 20)}...`);
}

if (process.env.NODE_ENV === "development") {
  // @ts-expect-error - global type extension for MongoDB client
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    // @ts-expect-error - global type extension for MongoDB client
    global._mongoClientPromise = client.connect();
  }
  // @ts-expect-error - global type extension for MongoDB client
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Helper to get database instance
export async function getDatabase(): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}

export default clientPromise;
