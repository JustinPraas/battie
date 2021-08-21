import { Command } from "../../models/Command";
import * as path from "path";
import * as fs from "fs";
import { SOUND_FILES_DIR_REL_PATH } from "./sounds-module";

const COMMAND = "play"
const SUPPORTED_FILETYPES = ["mp3", "mp4", "wav"]

export const playSound: Command = {
    name: `${COMMAND}`,
    format: `${COMMAND} <sound name>`,
    description: "Speelt het geluid af met <sound name>.",
    execute(message, args) {
        if (!message.member?.voice.channel)
            return message.reply("Je moet in een spraak-kanaal zitten");

        // Checking if the bot is in a voice channel.
        if (message.guild?.me?.voice.channel)
            return message.reply("Ik ben al aan het afspelen");

        try {
            const specifiedSound = args.shift()!

            let filePath: string = "";
            let fileExists: boolean = false;
            for (let i = 0; i < SUPPORTED_FILETYPES.length; i++) {

                // Construct potential filepath
                filePath = path.join(
                    __dirname,
                    SOUND_FILES_DIR_REL_PATH,
                    `${specifiedSound}.${SUPPORTED_FILETYPES[i]}`
                );

                // If file exists, break
                if (fs.existsSync(filePath)) {
                    fileExists = true;
                    break;
                }
            }
            

            if (fileExists) {
                // Joining the channel and creating a VoiceConnection.
                message.member.voice.channel
                    .join()
                    .then((voiceConnection) => {
                        // Playing the music, and, on finish, disconnecting the bot.
                        voiceConnection
                            .play(filePath)
                            .on("finish", () => voiceConnection.disconnect());
                        message.reply(`${args} aan het afspelen.`);
                    })
                    .catch((e) => console.log(e));
            } else {
                message.reply(`Je gevraagde sound '${specifiedSound}' bestaat niet`);
            }
        } catch (err) {
            console.error(err);
        }
    },
};
