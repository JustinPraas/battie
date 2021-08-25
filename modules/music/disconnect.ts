import { Command } from "../../models/Command";
import { guildMusicQueueMap, QueueContruct } from "./music-module";

const COMMAND = "dc";

export const disconnect: Command = {
    name: COMMAND,
    format: `${COMMAND}`,
    description: "Zorgt ervoor dat de Battiebot stopt met muziek afspelen",
    execute(message, _) {
        const guild = message.guild;

        if (!guild) {
            return message.channel.send("Dit kan je alleen in een server uitvoeren")
        }

        const guildMusicQueue: QueueContruct = guildMusicQueueMap.get(guild.id)!;
        guildMusicQueue.voiceChannel.leave();
        guildMusicQueueMap.delete(guild.id);  
    },
};
