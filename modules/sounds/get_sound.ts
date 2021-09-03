import { Command } from "../../models/Command";
import * as path from "path";
import * as fs from "fs";
import { SOUND_FILES_DIR_REL_PATH } from "./sounds-module";
import { COMMAND_PREFIX } from "../../main/discord";

const COMMAND = "sounds"

export const getSound: Command = {
    name: `${COMMAND}`,
    format: `${COMMAND}`,
    description: "Geeft alle beschikbare geluiden weer van de soundboard.",
    execute(message, _) {
        const files = fs.readdirSync(path.join(__dirname, SOUND_FILES_DIR_REL_PATH)).map(file => file.split(".")[0]);
        message.channel.send(
            `Hier een lijst met beschikbare sounds. Typ \`${COMMAND_PREFIX}play <filenaam>\` om er een af te spelen`
        );
        message.channel.send(files);
    },
};
