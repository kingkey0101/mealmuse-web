import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient>

if (!uri) {
    throw new Error("Please add MONGODB_URI to your .env.local");
}

if (process.env.NODE_ENV === "development") {
    //@ts-ignore
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        // @ts-ignore
        global._mongoClientPromise = client.connect();
    }
    // @ts-ignore
    clientPromise = global._mongoClientPromise;
} else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

export default clientPromise;