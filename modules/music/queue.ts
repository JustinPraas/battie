import { Command } from "../../models/Command";
import { getHoursFromSeconds, getMinutesFromSeconds, getSecondsFromSeconds } from "../../utils";
import { guildMusicQueueMap, QueueConstruct } from "./music-module";

const COMMAND = "queue";

export const queue: Command = {
    name: COMMAND,
    format: `${COMMAND}`,
    description: "Laat zien welk nummer er in de queue staan",
    execute(message, _) {
        const guild = message.guild;

        if (!guild) {
            return message.channel.send(
                "Dit kan je alleen in een server uitvoeren"
            );
        }

        const guildMusicQueue: QueueConstruct = guildMusicQueueMap.get(
            guild.id
        )!;
        if (!guildMusicQueue) {
            return message.channel.send("Er wordt momenteel niets afgespeeld");
        }

        const songs = guildMusicQueue.songs;
        if (songs.length < 2) {
            message.channel.send("Er staan geen nummers in de wachtrij")
        } else {
            let queueStringBuilder = "De volgende nummers staan in de wachtrij:"
            songs.forEach(s => {
                const i = songs.indexOf(s) + 1
                const songDurationSeconds = parseInt(s.lengthSeconds);
                const hours = getHoursFromSeconds(songDurationSeconds);
                const minutes = getMinutesFromSeconds(songDurationSeconds);
                const seconds = getSecondsFromSeconds(songDurationSeconds);
                const durationString = `${hours > 0 ? hours + ":" : ""}${minutes}:${seconds}`
                queueStringBuilder += `\n\`${i}. [${durationString}]\` **${s.title}**`
            });
            message.channel.send(queueStringBuilder);
        }
    },
};
