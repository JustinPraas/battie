import { ApplicationCommandData, CommandInteraction } from "discord.js";

export interface Command {
    command: ApplicationCommandData,
    execute: (interaction: CommandInteraction) => void;
}
