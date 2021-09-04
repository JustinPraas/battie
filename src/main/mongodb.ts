import { Db, MongoClient } from "mongodb";
import { isProduction } from "./main";

// Construct mongo client and Db
export let mongoClient: MongoClient | null = null;
export let battieDb: Db | null = null;

export function setBattieDb(mongoClient: MongoClient) {
    const MONGODB_DATABASE = isProduction ? "battiebot" : "betabot"
    battieDb = mongoClient.db(MONGODB_DATABASE);
}

export function getMongoClient() {
    if (!mongoClient) {
        // Extract environment variables
        const MONGODB_USER = process.env.MONGODB_USER;
        const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD;
        const MONGODB_CLUSTER_URL = process.env.MONGODB_CLUSTER_URL;

        const MONGODB_URI = `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_CLUSTER_URL}?retryWrites=true&writeConcern=majority`;
        mongoClient = new MongoClient(MONGODB_URI);
    }
    return mongoClient
}