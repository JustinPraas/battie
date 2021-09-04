import { AudioPlayerStatus, createAudioPlayer, createAudioResource, entersState, joinVoiceChannel, StreamType, VoiceConnectionStatus } from "@discordjs/voice";
import { GuildMember, VoiceChannel } from "discord.js";
import { battieDb } from "../../process/mongodb";
import { Command } from "../../models/Command";
import { guildMusicSubscriptionMap } from "../music/_music-commands";
import { createDiscordJSAdapter } from "./adapter";
import { DEFAULT_VOLUME, RANDOM_SOUND_NAME } from "./_sound-commands";
import { shuffle } from "../../util/utils";

const player = createAudioPlayer();

export const soundPlay: Command = {
    command:
    {
        name: 'play-sound',
        description: 'Speelt een sound af van de soundboard',
        options: [{
            name: 'name',
            type: 'STRING' as const,
            description: 'De naam die je de sound wil geven',
            required: true,
        }]
    },
    async execute(interaction, guild, _) {
        await interaction.deferReply()

        let subscription = guildMusicSubscriptionMap.get(guild.id)
        if (subscription && (subscription.queue.length > 0 || subscription.audioPlayer.state.status != AudioPlayerStatus.Idle)) {
            await interaction.followUp("Ik kan helaas geen geluiden afspelen terwijl er tracks worden afgespeeld :(")
            return
        }

        if (battieDb) {
            const collection = battieDb.collection("soundregistrations");

            const nameArg = interaction.options.get('name')!.value! as string;
            let soundDocument = null;
            if (nameArg && nameArg == RANDOM_SOUND_NAME) {
                soundDocument = shuffle(await collection.find().toArray())[0]
            } else {
                soundDocument = await collection.findOne({ name: nameArg, guildId: guild.id })
            }

            if (!soundDocument) {
                await interaction.followUp("Er bestaat geen sound registratie met deze naam :(")
                return
            }

            const url = soundDocument.url
            const name = soundDocument.name
            const volume = soundDocument.volume ? soundDocument.volume : DEFAULT_VOLUME;

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
                await playSound(url, volume)
                await interaction.followUp(`Ik speel *${name}* af...`)
                return
            } else {                
                await interaction.followUp("Ik kon je voice channel niet vinden :(")
                return
            }
        } else {
            await interaction.followUp("Kon geen connectie vinden met de database :(")
            return
        }
    }
}

function playSound(url: string, volume: number) {
    const resource = createAudioResource(url, {
        inputType: StreamType.Arbitrary,
        inlineVolume: true,
    });

    resource.volume?.setVolumeLogarithmic(volume)

    player.play(resource);

    return entersState(player, AudioPlayerStatus.Playing, 10e3);
}