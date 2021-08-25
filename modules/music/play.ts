import { Guild, TextChannel } from "discord.js";
import ytdl, { MoreVideoDetails } from "ytdl-core";
import { log } from "../../main";
import { Command } from "../../models/Command";
import { guildMusicQueueMap, QueueContruct, Song } from "./music-module";

const COMMAND = "play";

export const play: Command = {
    name: COMMAND,
    format: `${COMMAND} <youtube-url> [x:y]`,
    description: "Speelt een youtube video af. Als x:y zijn meegegeven, dan begint de audio vanaf minuut x en seconde y",
    execute(message, args) {
        const guild = message.guild;
        if (!guild) {
            return message.channel.send("Je moet deze command gebruiken in een server");
        }

        const isTextChannel = message.channel instanceof TextChannel
        if (!isTextChannel) {
            return message.channel.send("Je moet dit in een tekst kanaal in een discord server gebruiken")
        }

        const serverQueue = guildMusicQueueMap.get(guild.id);
        const url = args.shift();
        if (!url) {
            return message.channel.send("Je hebt geen URL meegegeven???");
        }

        const voiceChannel = message.member?.voice.channel;
        if (!voiceChannel) {
            return message.channel.send(
                "Je moet wel in een voice channel zijn om dit te doen brozzer"
            );
        }

        const botUser = message.client.user;
        if (!botUser) {
            return message.channel.send("Blijkbaar is de bot geen user... what?")
        }

        const permissions = voiceChannel.permissionsFor(botUser);
        if (
            permissions &&
            (!permissions.has("CONNECT") || !permissions.has("SPEAK"))
        ) {
            return message.channel.send(
                "Helaas heb ik hier geen permissies voor :("
            );
        }

        // Validate the start time, if given
        const startTimestamp = args.shift()
        if (startTimestamp) {
            const minute = startTimestamp.split(":")[0]
            const second = startTimestamp.split(":")[1]

            if (Number.isNaN(parseInt(minute)) || Number.isNaN(parseInt(second))) {
                return message.channel.send("Er ging wat mis met het parsen van de starttijd... Weet je wel wat je doet?");
            }
        }        

        // Get song info
        ytdl.getInfo(url).then(response => {

            let startSeconds = 0;
            if (startTimestamp) {     
                const minute = startTimestamp.split(":")[0]
                const second = startTimestamp.split(":")[1]           
                startSeconds = parseInt(minute) * 60 + parseInt(second)
            }

            // Extract video info from response
            const videoDetails: MoreVideoDetails = response.videoDetails;
            const song: Song = {
                title: videoDetails.title,
                url: videoDetails.video_url,
                lengthSeconds: videoDetails.lengthSeconds,
                viewCount: videoDetails.viewCount,
                startTimeSeconds: startSeconds
            };

            if (!serverQueue) {
                // Creating the contract for our queue
                const queueContruct: QueueContruct = {
                    textChannel: message.channel as TextChannel,
                    voiceChannel: voiceChannel,
                    connection: null,
                    dispatcher: null,
                    songs: [],
                    volume: 5,
                    playing: true,
                };

                // Setting the queue using our contract
                guildMusicQueueMap.set(guild.id, queueContruct);

                // Pushing the song to our songs array
                queueContruct.songs.push(song);

                try {
                    // Attempt to join voice channel and set the connection in the queue construct
                    voiceChannel.join().then(connection => {
                        queueContruct.connection = connection;
                        // Calling the play function to start a song
                        playSong(guild, queueContruct.songs[0]);
                    });                    
                } catch (err) {
                    // Printing the error message if the bot fails to join the voicechat
                    console.log(err);
                    guildMusicQueueMap.delete(guild.id);
                    return message.channel.send(err);
                }
            } else {
                serverQueue.songs.push(song);
                return message.channel.send(
                    `**${song.title}** is aan de queue toegevoegd!`
                );
            }
        })
        .catch(error => {
            log.error("Er ging wat fout bij het toevoegen van een liedje aan de queue:", error)
            message.channel.send("Er ging wat fout bij het toevoegen van het liedje aan de lijst... :(")
        });
    },
};

function playSong(guild: Guild, song: Song) {
    const guildMusicQueue = guildMusicQueueMap.get(guild.id)!;
    
    if (!song) {
        guildMusicQueue.voiceChannel.leave();
        guildMusicQueueMap.delete(guild.id);
        return;
    }

    const voiceConnection = guildMusicQueue.connection;

    if (!voiceConnection) {
        return log.error("Could not find a voice connection for guild: ", guild)
    }

    const audioStream = ytdl(song.url, {quality: "highestaudio"});

    const dispatcher = voiceConnection
        .play(audioStream, {seek: song.startTimeSeconds})
        .on("start", () => {
            dispatcher.setVolumeLogarithmic(guildMusicQueue.volume / 5);
            guildMusicQueue.textChannel.send(`Ik speel nu: **${song.title}**`);
            log.info(`Battiebot is playing a song in **${guild.name}**: **${song.title}`);
        })
        .on("finish", () => {
            guildMusicQueue.songs.shift();
            playSong(guild, guildMusicQueue.songs[0]);
        })
        .on("error", (error: any) => console.error(error));   
        
    guildMusicQueue.dispatcher = dispatcher;
}
