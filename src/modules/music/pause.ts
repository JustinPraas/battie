import { Command } from "../../models/Command";
import { guildMusicSubscriptionMap } from "./music-module";

export const pause: Command = {
    command:
    {
        name: 'pause',
        description: 'Pauzeert de huidige track',
    },
    async execute(interaction) {
        const guild = interaction.guild;

        if (!guild) {
            await interaction.reply("Dit kan je alleen in een server uitvoeren")
            return
        }

        const subscription = guildMusicSubscriptionMap.get(guild.id);
        if (subscription) {
            subscription.audioPlayer.pause();
            await interaction.reply("Ik heb de track gepauzeert");
        } else {
            await interaction.reply('Ik speel niets af in deze server!');
        }
    },
};
