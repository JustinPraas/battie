import { Command } from "../../models/Command";
import { guildMusicSubscriptionMap } from "./_music-commands";

export const pause: Command = {
    command:
    {
        name: 'pause',
        description: 'Pauzeert de huidige track',
    },
    async execute(interaction, guild, _) {
        const subscription = guildMusicSubscriptionMap.get(guild.id);
        if (subscription) {
            subscription.audioPlayer.pause();
            await interaction.reply("Ik heb de track gepauzeert");
        } else {
            await interaction.reply('Ik speel niets af in deze server!');
        }
    },
};
