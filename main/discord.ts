import { isProduction, log } from "./main";
import Discord from "discord.js";
import { currentActivity, startSchedulingNewActivites } from "../modules/misc/activity_changer";
import { startSchedulingHydrationReminders } from "../modules/misc/hydration";
import { instantiateSchedulesFromDatabase } from "../modules/reminders/remind_me";
import { Command } from "../models/Command";
import { miscCommands } from "../modules/misc/scheduling-module";
import { musicCommands } from "../modules/music/music-module";
import { reminderCommands } from "../modules/reminders/reminders-module";
import { rolesCommands } from "../modules/roles/roles-module";
import { soundsCommands } from "../modules/sounds/sounds-module";
import { utilityCommands } from "../modules/utilities/utilities-module";
import { mongoClient } from "./mongodb";

export const DISCORD_TOKEN = isProduction ? process.env.DISCORD_KEY : process.env.DISCORD_KEY_BETA;
export const discordClient = new Discord.Client();

export function loginDiscord() {    
    discordClient.login(DISCORD_TOKEN);
}

discordClient.once("ready", () => {
    discordClient.user?.setActivity(currentActivity.activity, currentActivity.options);

    startSchedulingNewActivites(discordClient);
    startSchedulingHydrationReminders(discordClient);
    instantiateSchedulesFromDatabase();

    log.info(`Battiebot${isProduction ? "" : " (beta)"} is aanwezig`);
});

discordClient.on("message", (message) => {
    if (message.content.startsWith(COMMAND_PREFIX)) {
        handleCommand(message);
        return;
    }
});

discordClient.on("disconnect", () => {
    log.info("Battiebot disconnecting...")

    log.info("Disconnecting connection to MongoDb...")
    mongoClient.close();
});


// Set command prefix based on environment
export const COMMAND_PREFIX = isProduction ? "$" : "%";

// Get all desired commands that the server should handle
export const commandList: Command[] = [
    ...rolesCommands,
    ...soundsCommands,
    ...utilityCommands,
    ...miscCommands,
    ...musicCommands,
    ...reminderCommands
];

// Make a collection of all the commands the server should handle
const commands = new Discord.Collection<string, Command>();

// Fill the commands collection
commandList.forEach((command) => commands.set(command.name, command));

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