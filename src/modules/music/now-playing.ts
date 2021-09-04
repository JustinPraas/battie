import { Command } from "../../models/Command";
import { guildMusicSubscriptionMap } from "./music-module";

export const nowPlaying: Command = {    
    command:
    {
        name: 'now-playing',
        description: 'Toont de track die momenteel afgespeeld wordt',
    },
    async execute(interaction, guild, _) {       
        const subscription = guildMusicSubscriptionMap.get(guild.id);
        if (subscription) {
            await interaction.reply(`Ik speel momenteel: ${subscription.queue[0]}`);
        } else {
            await interaction.reply('Ik speel niets af in deze server!');
        }
    },
};
