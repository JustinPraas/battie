import Discord from "discord.js";
import { Command } from "./models/Command";
import { helpCommand } from "./modules/help";
import { rolesCommands } from "./modules/roles/roles-module";
import {
    currentActivity,
    startSchedulingNewActivites,
} from "./modules/scheduling/activity_changer";
import { startSchedulingHydrationReminders } from "./modules/scheduling/hydration";
import { schedulingCommands } from "./modules/scheduling/scheduling-module";
import { soundsCommands } from "./modules/sounds/sounds-module";
import { utilityCommands } from "./modules/utilities/utilities-module";
import { Logger } from "tslog";
import { musicCommands } from "./modules/music/music-module";
import { Db, MongoClient } from "mongodb";

export const log: Logger = new Logger();

require("dotenv").config({ path: __dirname + "../../environment.env" });

const ACCESS_TOKEN = process.env.DISCORD_KEY;

// const isProductionEnv = process.env.NODE_ENV === "production";

// Setup discord client
const client = new Discord.Client();
client.login(ACCESS_TOKEN);

// Setup mongo client
const user = process.env.MONGODB_USER;
const password = process.env.MONGODB_PASSWORD;
const clusterUrl = process.env.MONGODB_CLUSTER_URL;
const uri = `mongodb+srv://${user}:${password}@${clusterUrl}?retryWrites=true&writeConcern=majority`;
const mongoClient = new MongoClient(uri);
export let battieDb: Db | null = null;

mongoClient.connect().then(() => {
    battieDb = mongoClient.db("battiebot");
    log.info("Connected to MongoDB database");
})
.catch(err => {
    log.error(err);
    mongoClient.close();
})

// Set command prefix based on environment
export const COMMAND_PREFIX = "$";

// Get all desired commands that the server should handle
export const commandList: Command[] = [
    helpCommand,
    ...rolesCommands,
    ...soundsCommands,
    ...utilityCommands,
    ...schedulingCommands,
    ...musicCommands,
];

// Make a collection of all the commands the server should handle
const commands = new Discord.Collection<string, Command>();

// Fill the commands collection
commandList.forEach((command) => commands.set(command.name, command));

client.once("ready", () => {
    client.user?.setUsername(`Battiebot`);
    client.user?.setActivity(currentActivity.activity, currentActivity.options);
    startSchedulingNewActivites(client);
    startSchedulingHydrationReminders(client);

    log.info("Battiebot is aanwezig");
});

client.on("message", (message) => {
    if (message.content.startsWith(COMMAND_PREFIX)) {
        handleCommand(message);
        return;
    }
});

client.on("disconnect", () => {
    log.info("Battiebot disconnecting...")

    log.info("Disconnceting connection to MongoDb...")
    mongoClient.close();
});

function handleCommand(message: Discord.Message) {
    // Get the command and arguments
    const args = message.content.slice(COMMAND_PREFIX.length).split(/ +/);

    // Get the command and remove it from args array
    const command = args.shift()?.toLowerCase();
    if (!command) return;

    // Get the desired client command
    const clientCommand = commands.get(command);

    // If command exists, execute it
    if (clientCommand) clientCommand.execute(message, args);
    // Otherwise return
    else return;
}