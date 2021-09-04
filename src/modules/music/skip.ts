import { CommandInteraction, GuildMember } from "discord.js";
import { Command } from "../../models/Command";
import { MusicSubscription } from "../../models/MusicSubscription";
import { guildMusicSubscriptionMap } from "./music-module";

export const skip: Command = {
    command: {
        name: 'skip',
        description: 'Skipt de huidige track',
    },
    async execute(interaction, guild, _) {
        // Get server queue
        const subscription = guildMusicSubscriptionMap.get(guild?.id);
        if (!subscription) {
            await interaction.reply("Er staan geen tracks in de wachtrij o.i.d.")
            return
        }

        // Skip the song
        skipSong(interaction, subscription);
    },
};

async function skipSong(interaction: CommandInteraction, musicSubscription: MusicSubscription) {
    const memberVoiceChannel = (interaction.member as GuildMember).voice.channel
    if (!memberVoiceChannel ) {
        await interaction.reply(
            "Je moet in een voice channel zijn om de track te skippen"
        );
        return;
    }

    if (musicSubscription) {
        musicSubscription.audioPlayer.stop();
        await interaction.reply('De track is nu geskipt!');
        return;
    } else {
        await interaction.reply('Ik kan nu geen tracks skippen!');
    }
}
