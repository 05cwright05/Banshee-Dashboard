import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI!;

const options = {
  tls: true,
  tlsAllowInvalidCertificates:
    process.env.MONGO_TLS_ALLOW_INVALID_CERTS === "true",
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // Preserve connection across HMR in development
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

export const DB_NAME = "voice_security_lab";
export const COLLECTION_NAME = "outbound_evaluations";
