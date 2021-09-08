import { ApplicationCommandData, CommandInteraction, Guild, User } from "discord.js";

export interface Command {
    command: ApplicationCommandData,
    modsOnly?: boolean,
    execute: (interaction: CommandInteraction, guild: Guild, user: User) => void;
}
