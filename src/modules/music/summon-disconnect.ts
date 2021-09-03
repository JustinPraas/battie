import { TextChannel, User } from "discord.js";
import { log } from "../../main/main";
import { Command } from "../../models/Command";
import { reactWithDefaultEmoji } from "../../util/utils";
import { getEmptyQueueConstruct, guildMusicQueueMap, QueueConstruct } from "./music-module";

const DC_COMMAND = "dc";

export const disconnect: Command = {
    name: DC_COMMAND,
    format: `${DC_COMMAND}`,
    description: "Zorgt ervoor dat de Battiebot stopt met muziek afspelen",
    execute(message, _) {
        const guild = message.guild;

        if (!guild) {
            return message.channel.send(
                "Dit kan je alleen in een server uitvoeren"
            );
        }

        const guildMusicQueue = guildMusicQueueMap.get(guild.id);

        if (!guildMusicQueue || !guildMusicQueue.voiceChannel) {
            return message.channel.send(
                "Ik blijk niet eens actief te zijn... waarom wil je me zo graag weg hebben???"
            );
        }

        guildMusicQueue.voiceChannel.leave();
        guildMusicQueueMap.delete(guild.id);

        reactWithDefaultEmoji(message, "👍🏼");
    },
};

const SUMMON_COMMAND = "summon";

export const summon: Command = {
    name: SUMMON_COMMAND,
    format: `${SUMMON_COMMAND}`,
    description: "Roept mij op in dezelfe voice channel waar jij in zit!",
    execute(message, _) {
        const guild = message.guild;
        const user: User = message.author;

        if (!guild) {
            return message.channel.send(
                "Dit kan je alleen in een server uitvoeren"
            );
        }

        const guildMember = guild.members.cache.get(user.id);
        if (!guildMember) {
            return message.channel.send(
                "Je bent volgens mij geen lid van deze server, hoe dan?"
            );
        }

        const userVoiceChannel = guildMember.voice.channel;
        if (!userVoiceChannel) {
            return message.channel.send(
                "Je zit niet eens in een voice channel ??"
            );
        }

        const guildMusicQueue = guildMusicQueueMap.get(guild.id);

        if (guildMusicQueue) {
            userVoiceChannel
                .join()
                .then(
                    (voiceConnection) => {
                        reactWithDefaultEmoji(message, "👍🏼");
                        guildMusicQueue.connection = voiceConnection
                        guildMusicQueue.voiceChannel = voiceConnection.channel
                    }
                )
                .catch((e) => log.error(e));
        } else {
            const newQueueConstruct: QueueConstruct = getEmptyQueueConstruct()
            newQueueConstruct.textChannel = message.channel as TextChannel
            userVoiceChannel
                .join()
                .then(
                    (voiceConnection) => {
                        reactWithDefaultEmoji(message, "👍🏼");
                        newQueueConstruct.connection = voiceConnection
                        newQueueConstruct.voiceChannel = voiceConnection.channel
                    }
                )
                .catch((e) => log.error(e));
            guildMusicQueueMap.set(guild.id, newQueueConstruct)
        }
    },
};
