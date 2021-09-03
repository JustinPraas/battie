// import { Command } from "../../models/Command";
// import * as path from "path";
// import * as fs from "fs";
// import { SOUND_FILES_DIR_REL_PATH } from "./sounds-module";
// import { Message, MessageAttachment } from "discord.js";

// const COMMAND = "sound-upload";

// export const uploadSound: Command = {
//     name: `${COMMAND}`,
//     format: `${COMMAND}`,
//     description:
//         "Upload een mp3 bestand, kleiner dan 300KB door middel van een attachment",
//     execute(message, _) {
//         // Check, validate and download attachment
//         const attachment: MessageAttachment | undefined =
//             message.attachments.first();
//         if (attachment && attachment.name) {
//             if (attachment.name.includes("mp3")) {
//                 if (attachment.size < 500 * 1000) {
//                     download(attachment.url, attachment.name, message);
//                 } else {
//                     message.channel.send(
//                         "Je bestand is te groot. Upload alleen bestanden kleiner dan 300KB..."
//                     );
//                 }
//             } else {
//                 message.channel.send("Je bestand is geen mp3 bestand");
//             }
//         } else {
//             message.channel.send(
//                 "Je hebt niet eens een attachment toegevoegd pfannekuchen"
//             );
//         }
//     },
// };

// function download(url: string, name: string, message: Message) {
//     const filePath = path.join(__dirname, SOUND_FILES_DIR_REL_PATH, name);

//     if (fs.existsSync(filePath)) {
//         return message.channel.send("Een soundbyte met deze naam bestaat al. Hernoem je bestand en probeer het opnieuw :)")
//     }

//     const fileWriteStream = fs.createWriteStream(filePath);

//     const got = require('got');
//     got.stream(url)
//         .pipe(fileWriteStream)
//         .on("close", () =>
//             message.channel.send("Je bestand is succesvol geupload")
//         );
// }
