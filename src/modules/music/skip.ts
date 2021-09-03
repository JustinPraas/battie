import { CommandInteraction, GuildMember } from "discord.js";
import { Command } from "../../models/Command";
import { MusicSubscription } from "../../models/MusicSubscription";
import { guildMusicSubscriptionMap } from "./music-module";

export const skip: Command = {
    command: {
        name: 'skip',
        description: 'Skipt de huidige track',
    },
    async execute(interaction) {
        const guild = interaction.guild;

        if (!guild) {
            await interaction.reply("Dit kan je alleen in een server uitvoeren")
            return;
        }

        // Get server queue
        const musicSubscription = guildMusicSubscriptionMap.get(guild?.id);
        if (!musicSubscription) {
            await interaction.reply("Er staan geen tracks in de wachtrij o.i.d.")
            return
        }

        // Skip the song
        skipSong(interaction, musicSubscription);
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
