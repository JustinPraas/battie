import { Command } from "../../models/Command";
import { guildMusicSubscriptionMap } from "./music-module";

export const nowPlaying: Command = {    
    command:
    {
        name: 'np',
        description: 'Toont de track die momenteel afgespeeld wordt',
    },
    async execute(interaction) {
        const guild = interaction.guild;

        if (!guild) {
            await interaction.reply(
                "Dit kan je alleen in een server uitvoeren"
            );
            return
        }
       
        const subscription = guildMusicSubscriptionMap.get(guild.id);
        if (subscription) {
            await interaction.reply(`Ik speel momenteel: ${subscription.queue[0]}`);
        } else {
            await interaction.reply('Ik speel niets af in deze server!');
        }
    },
};
