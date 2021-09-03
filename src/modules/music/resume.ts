import { Command } from "../../models/Command";
import { guildMusicSubscriptionMap } from "./music-module";

export const resume: Command = {
    command: 
    {
        name: 'resume',
        description: 'Hervat de huidige track',
    },
    async execute(interaction) {
        const guild = interaction.guild;

        if (!guild) {
            await interaction.reply("Dit kan je alleen in een server uitvoeren")
            return
        }

        const subscription = guildMusicSubscriptionMap.get(guild.id);
        if (!subscription) {
            await interaction.reply("Ik kan geen tracks resumen ALS ER GEEN TRACKS IN DE QUEUE STAAN :@")
            return
        }

        if (subscription) {
			subscription.audioPlayer.unpause();
			await interaction.reply("De track wordt hervat");
		} else {
			await interaction.reply('Ik speel niets af in deze server!');
		}
    },
};
