import { Db, MongoClient } from "mongodb";
import { isProduction } from "./main";

// Extract environment variables
const MONGODB_USER = process.env.MONGODB_USER;
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD;
const MONGODB_CLUSTER_URL = process.env.MONGODB_CLUSTER_URL;
const MONGODB_DATABASE = isProduction ? "battiebot" : "betabot"

// Construct mongo client and Db
const MONGODB_URI = `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_CLUSTER_URL}?retryWrites=true&writeConcern=majority`;
export const mongoClient = new MongoClient(MONGODB_URI);
export let battieDb: Db | null = null;

export function setBattieDb() {
    battieDb = mongoClient.db(MONGODB_DATABASE);
}