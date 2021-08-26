import { Command } from "../../models/Command";
import { guildMusicQueueMap, QueueContruct } from "./music-module";

const COMMAND = "np";

export const nowPlaying: Command = {
    name: COMMAND,
    format: `${COMMAND}`,
    description: "Laat zien welk nummer er momenteel afgespeeld wordt",
    execute(message, _) {
        const guild = message.guild;

        if (!guild) {
            return message.channel.send(
                "Dit kan je alleen in een server uitvoeren"
            );
        }

        const guildMusicQueue: QueueContruct = guildMusicQueueMap.get(
            guild.id
        )!;
        if (!guildMusicQueue) {
            return message.channel.send("Er wordt momenteel niets afgespeeld");
        }

        const currentSong = guildMusicQueue.songs[0];
        const dispatcher = guildMusicQueue.dispatcher;

        if (!dispatcher) {
            return message.channel.send("Er is geen Dispatcher, wtf?");
        }

        const currentTimeMillis = dispatcher.totalStreamTime;
        let timeString = "";

        if (currentTimeMillis < 3600 * 1000) {
            timeString = new Date(currentTimeMillis).toISOString().substr(14, 5);
        } else {
            timeString = new Date(currentTimeMillis).toISOString().substr(11, 8);
        }
        
        message.channel.send(
            `Ik speel momenteel **${currentSong.title}** op tijdstip **${timeString}**`
        );
    },
};
