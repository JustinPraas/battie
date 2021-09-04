require("dotenv").config({ path: __dirname + "../../../environment.env" });
import { Logger } from "tslog";
import { loginDiscord } from "./discord";
import { getMongoClient, mongoClient, setBattieDb } from "./mongodb";
export const log: Logger = new Logger();

// Check for production
export const isProduction = process.env.PRODUCTION && process.env.PRODUCTION == "true"

function run() {
    if (isProduction) log.info("Running in production mode...")
    
    getMongoClient().connect().then(() => {
        setBattieDb(getMongoClient())
        log.info("Connected to MongoDB database");

        loginDiscord()
    })
    .catch(err => {
        log.error(err);
        getMongoClient().close();
    })
}

// Run the bot
run();
