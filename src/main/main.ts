require("dotenv").config({ path: __dirname + "../../../environment.env" });
import { Logger } from "tslog";
import { loginDiscord } from "./discord";
import { mongoClient, setBattieDb } from "./mongodb";
export const log: Logger = new Logger();

// Check for production
export const isProduction = process.env.PRODUCTION && process.env.PRODUCTION == "true"

function run() {
    if (isProduction) log.info("Running in production mode...")
    
    mongoClient.connect().then(() => {
        setBattieDb()
        log.info("Connected to MongoDB database");

        loginDiscord()
    })
    .catch(err => {
        log.error(err);
        mongoClient.close();
    })
}

// Run the bot
run();
