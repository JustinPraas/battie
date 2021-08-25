import { Message } from "discord.js";
import { Command } from "../../models/Command";
import { guildMusicQueueMap } from "./music-module";

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

        // Skip the song
        skipSong(message, serverQueue);   
    },
};

function skipSong(message: Message, serverQueue: any) {
    if (!message.member?.voice.channel)
        return message.channel.send(
            "Je moet in een voice channel zijn om de muziek te skippen"
        );
    if (!serverQueue)
        return message.channel.send("Er is geen liedje die ik kan skippen LOL");
    serverQueue.connection.dispatcher.end();
}
