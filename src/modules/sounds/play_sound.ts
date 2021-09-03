// import { Command } from "../../models/Command";
// import * as path from "path";
// import * as fs from "fs";
// import { SOUND_FILES_DIR_REL_PATH } from "./sounds-module";
// import {
//     getEmptyQueueConstruct,
//     guildMusicSubscriptionMap,
// } from "../music/music-module";
// import { TextChannel } from "discord.js";
// import { reactWithDefaultEmoji } from "../../util/utils";

// const COMMAND = "sound";
// const SUPPORTED_FILETYPES = ["mp3", "mp4", "wav"];

// export const playSound: Command = {
//     name: `${COMMAND}`,
//     format: `${COMMAND} <sound name>`,
//     description: "Speelt het geluid af met <sound name>.",
//     execute(message, args) {
//         if (!message.member?.voice.channel)
//             return message.reply("Je moet in een spraak-kanaal zitten");

//         // Checking if the bot is in a voice channel.
//         const guild = message.guild;
//         if (!guild) {
//             return message.channel.send(
//                 "Zorg ervoor dat je altijd in een server dit bericht stuurt..."
//             );
//         }

//         let guildMusicQueue = guildMusicSubscriptionMap.get(guild.id);
//         if (guildMusicQueue) {
//             if (guildMusicQueue.playing) {
//                 return message.reply("Ik ben al een liedje aan het afspelen!");
//             }
//         } else {
//             guildMusicQueue = getEmptyQueueConstruct();
//             guildMusicQueue.textChannel = message.channel as TextChannel;
//             guildMusicSubscriptionMap.set(guild.id, guildMusicQueue);
//         }

//         try {
//             const specifiedSound = args.shift()!;

//             let filePath: string = "";
//             let fileExists: boolean = false;
//             for (let i = 0; i < SUPPORTED_FILETYPES.length; i++) {
//                 // Construct potential filepath
//                 filePath = path.join(
//                     __dirname,
//                     SOUND_FILES_DIR_REL_PATH,
//                     `${specifiedSound}.${SUPPORTED_FILETYPES[i]}`
//                 );

//                 // If file exists, break
//                 if (fs.existsSync(filePath)) {
//                     fileExists = true;
//                     break;
//                 }
//             }

//             if (fileExists) {
//                 // Joining the channel and creating a VoiceConnection.
//                 const channel = guildMusicQueue.voiceChannel ? guildMusicQueue.voiceChannel : message.member.voice.channel
//                 channel
//                     .join()
//                     .then((voiceConnection) => {
//                         // Playing the music, and, on finish, disconnecting the bot.
//                         guildMusicQueue!.connection = voiceConnection;
//                         guildMusicQueue!.voiceChannel = channel;
//                         guildMusicQueue!.playing = true;
//                         voiceConnection
//                             .play(filePath)
//                             .on("finish", () => {
//                                 if (guildMusicQueue) {
//                                     guildMusicQueue.playing = false
//                                 }
//                             })
//                             reactWithDefaultEmoji(message, "👍🏼");
//                     })
//                     .catch((e) => console.log(e));
//             } else {
//                 message.reply(
//                     `Je gevraagde sound '${specifiedSound}' bestaat niet`
//                 );
//             }
//         } catch (err) {
//             console.error(err);
//         }
//     },
// };
