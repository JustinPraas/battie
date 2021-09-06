import { AudioPlayerStatus, AudioResource } from "@discordjs/voice";
import { Command } from "../../models/Command";
import { Track } from "../../models/Track";
import { guildMusicSubscriptionMap } from "./_music-commands";

export const nowPlaying: Command = {    
    command:
    {
        name: 'now-playing',
        description: 'Toont de track die momenteel afgespeeld wordt',
    },
    async execute(interaction, guild, _) {       
        const subscription = guildMusicSubscriptionMap.get(guild.id);
        if (subscription) {
            const current =
				subscription.audioPlayer.state.status === AudioPlayerStatus.Idle
					? `Ik speel momenteel niets af!`
					: `Ik speel nu: **${(subscription.audioPlayer.state.resource as AudioResource<Track>).metadata.title}**`;
            await interaction.reply(current);
        } else {
            await interaction.reply('Ik speel niets af in deze server!');
        }
    },
};
