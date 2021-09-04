import { isProduction, log } from "./main";
import Discord, { CommandInteraction, Intents, Interaction, User } from "discord.js";
import { currentActivity, startSchedulingNewActivites } from "../modules/misc/activity_changer";
import { startSchedulingHydrationReminders } from "../modules/misc/hydration";
import { instantiateSchedulesFromDatabase } from "../modules/reminders/remind_me";
import { Command } from "../models/Command";
import { miscCommands } from "../modules/misc/scheduling-module";
import { musicCommands } from "../modules/music/music-module";
import { reminderCommands } from "../modules/reminders/reminders-module";
import { utilityCommands } from "../modules/utilities/utilities-module";
import { getMongoClient, mongoClient } from "./mongodb";
import { soundsCommands } from "../modules/sounds/sounds-module";

const guildIds = ["658627142908903427"]

export const discordClient = new Discord.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_VOICE_STATES
    ]
});

export function loginDiscord() {
    const DISCORD_TOKEN = isProduction ? process.env.DISCORD_KEY : process.env.DISCORD_KEY_BETA;
    discordClient.login(DISCORD_TOKEN);
}

discordClient.once("ready", async () => {
    discordClient.user?.setActivity(currentActivity.activity, currentActivity.options);

    startSchedulingNewActivites(discordClient);
    startSchedulingHydrationReminders(discordClient);
    instantiateSchedulesFromDatabase();

    log.info(`Battiebot${isProduction ? "" : " (beta)"} is aanwezig`);

    guildIds.forEach(async guildId => {
        const guild = await discordClient.guilds.fetch(guildId)
        guild.commands.set(commandList.map(c => c.command));
    })
});

discordClient.on("interactionCreate", async (interaction: Interaction) => {
    handleCommand(interaction as CommandInteraction);
});

discordClient.on("disconnect", () => {
    log.info("Battiebot disconnecting...")

    log.info("Disconnecting connection to MongoDb...")
    getMongoClient().close();
});


// Set command prefix based on environment
export const COMMAND_PREFIX = isProduction ? "$" : "%";

// Get all desired commands that the server should handle
export const commandList: Command[] = [
    ...soundsCommands,
    ...utilityCommands,
    ...miscCommands,
    ...musicCommands,
    ...reminderCommands
];

// Make a collection of all the commands the server should handle
const commands = new Discord.Collection<string, Command>();

// Fill the commands collection
commandList.forEach((command) => commands.set(command.command.name, command));

async function handleCommand(interaction: CommandInteraction) {
    // Get the desired client command
    const clientCommand = commands.get(interaction.command?.name!);

    const guild = interaction.guild
    if (!guild) {
        await interaction.reply("Deze command kan je alleen uitvoeren in een guild")
        return
    }

    const user: User = interaction.member?.user as User;
    if (!user) {
        await interaction.reply("Je bent geen gewone user :(")
        return
    }

    // If command exists, execute it
    if (clientCommand) clientCommand.execute(interaction, guild, user);
    // Otherwise return
    else return;
}