import { ApplicationCommandData, CommandInteraction, Guild, User } from "discord.js";

export interface Command {
    command: ApplicationCommandData,
    execute: (interaction: CommandInteraction, guild: Guild, user: User) => void;
}
