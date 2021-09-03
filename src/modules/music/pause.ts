import { Command } from "../../models/Command";
import { reactWithDefaultEmoji } from "../../util/utils";
import { guildMusicQueueMap, QueueConstruct } from "./music-module";

const COMMAND = "pause";

export const pause: Command = {
    name: COMMAND,
    format: `${COMMAND}`,
    description: "Zorgt ervoor dat de Battiebot het huidige nummer pauzeert",
    execute(message, _) {
        const guild = message.guild;

        if (!guild) {
            return message.channel.send("Dit kan je alleen in een server uitvoeren")
        }

        const guildMusicQueue = guildMusicQueueMap.get(guild.id);
        if (!guildMusicQueue) {
            return message.channel.send("Ik kan geen liedjes pauzeren ALS ER GEEN LIEDJES IN DE QUEUE STAAN :@")
        }

        const dispatcher = guildMusicQueue.dispatcher;
        if (!dispatcher) {
            return message.channel.send("Ik kan geen dispatcher vinden om te pauzeren");
        }

        dispatcher.pause();
        reactWithDefaultEmoji(message, "👍🏼");
    },
};
