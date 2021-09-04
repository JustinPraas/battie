import { AudioPlayerStatus, createAudioPlayer, createAudioResource, entersState, joinVoiceChannel, StreamType, VoiceConnectionStatus } from "@discordjs/voice";
import { GuildMember, VoiceChannel } from "discord.js";
import { log } from "../../main/main";
import { battieDb } from "../../main/mongodb";
import { Command } from "../../models/Command";
import { guildMusicSubscriptionMap } from "../music/music-module";
import { createDiscordJSAdapter } from "./adapter";

const player = createAudioPlayer();

export const soundboard: Command = {
    command:
    {
        name: 'soundboard',
        description: 'Speelt een sound af van de soundboard',
        options: [{
            name: 'name',
            type: 'STRING' as const,
            description: 'De naam die je de sound wil geven',
            required: true,
        }]
    },
    async execute(interaction, guild, _) {
        let subscription = guildMusicSubscriptionMap.get(guild.id)
        if (subscription && (subscription.queue.length > 0 || subscription.audioPlayer.state.status != AudioPlayerStatus.Idle)) {
            await interaction.reply("Ik kan helaas geen geluiden afspelen terwijl er tracks worden afgespeeld :(")
            return
        }

        if (battieDb) {
            const nameArg = interaction.options.get('name')!.value! as string;
            const collection = battieDb.collection("soundregistrations");
            const soundDocument = await collection.findOne({ name: nameArg, guildId: guild.id })

            if (!soundDocument) {
                await interaction.reply("Er bestaat geen sound registratie met deze naam :(")
                return
            }

            const url = soundDocument.url
            const name = soundDocument.name

            if (interaction.member instanceof GuildMember && interaction.member.voice.channel) {

                // Delete the now invalid music subscription entry
                guildMusicSubscriptionMap.delete(guild.id)

                const channel = interaction.member.voice.channel as VoiceChannel;
                const voiceConnection = joinVoiceChannel({
                    channelId: channel.id,
                    guildId: channel.guild.id,
                    adapterCreator: createDiscordJSAdapter(channel),
                });

                voiceConnection.subscribe(player)

                try {
                    await entersState(voiceConnection, VoiceConnectionStatus.Ready, 30e3);
                } catch (error) {
                    voiceConnection.destroy();
                    throw error;
                }
                await playSound(url)
                await interaction.reply(`Ik speel *${name}* af...`)
            } else {                
                await interaction.reply("Ik kon je voice channel niet vinden :(")
                return
            }
        } else {
            await interaction.reply("Kon geen connectie vinden met de database :(")
            return
        }
    }
}

function playSound(url: string) {
    const resource = createAudioResource(url, {
        inputType: StreamType.Arbitrary,
    });

    player.play(resource);

    return entersState(player, AudioPlayerStatus.Playing, 5e3);
}