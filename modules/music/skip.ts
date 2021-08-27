import { Message } from "discord.js";
import { Command } from "../../models/Command";
import { guildMusicQueueMap, QueueConstruct } from "./music-module";

const COMMAND = "skip";

export const skip: Command = {
    name: COMMAND,
    format: `${COMMAND}`,
    description: "Skipt het liedje die momenteel aan het afspelen is",
    execute(message, _) {
        const guild = message.guild;

        if (!guild) {
            return message.channel.send("Dit kan je alleen in een server uitvoeren")
        }

        // Get server queue
        const serverQueue = guildMusicQueueMap.get(guild?.id);

        if (!serverQueue) {
            return message.channel.send("Er staan geen liedjes in de wachtrij o.i.d.")
        }

        // Skip the song
        skipSong(message, serverQueue);   
    },
};

function skipSong(message: Message, serverQueue: QueueConstruct) {
    if (!message.member?.voice.channel) {
        return message.channel.send(
            "Je moet in een voice channel zijn om de muziek te skippen"
        );
    }

    if (!serverQueue) {
        return message.channel.send("Er is geen liedje die ik kan skippen LOL");
    }

    if (serverQueue.connection && serverQueue.playing) {
        serverQueue.connection.dispatcher.end();
        return message.channel.send("Ik vond dit ook al geen leuk liedje... ;)")
    } else {
        return message.channel.send("Ik ben geen liedje aan het afspelen...")
    }
}
