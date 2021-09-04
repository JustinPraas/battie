import { AudioPlayerStatus, AudioResource } from "@discordjs/voice";
import { Command } from "../../models/Command";
import { Track } from "../../models/Track";
import { guildMusicSubscriptionMap } from "./music-module";

export const queue: Command = {
    command: 
    {
        name: 'queue',
        description: 'Toont de huidige wachtrij van tracks',
    },
    async execute(interaction, guild, _) {
        const subscription = guildMusicSubscriptionMap.get(
            guild.id
        );

        if (subscription) {
			const current =
				subscription.audioPlayer.state.status === AudioPlayerStatus.Idle
					? `Ik speel momenteel niets af!`
					: `Ik speel nu: **${(subscription.audioPlayer.state.resource as AudioResource<Track>).metadata.title}**`;

			const queue = subscription.queue
				.map((track, index) => `${index + 1}) ${track.title}`)
				.join('\n');

			await interaction.reply(`${current}\n\n${queue}`);
		} else {
			await interaction.reply('Ik speel geen tracks af in deze server!');
		}
    },
};
