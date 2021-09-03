import { AudioPlayerStatus, entersState, joinVoiceChannel, VoiceConnectionStatus } from "@discordjs/voice";
import { GuildMember } from "discord.js";
import yts, { SearchResult } from "yt-search";
import { log } from "../../main/main";
import { Command } from "../../models/Command";
import { MusicSubscription } from "../../models/MusicSubscription";
import { Track } from "../../models/Track";
import { guildMusicSubscriptionMap } from "./music-module";

export const play: Command = {
	command: {
		name: 'play',
		description: 'Plays a song',
		options: [
			{
				name: 'track',
				type: 'STRING' as const,
				description: 'The URL of the song to play',
				required: true,
			},
		],
	},
	async execute(interaction) {
		await interaction.deferReply()

		const guild = interaction.guild;
		if (!guild) {
			await interaction.reply("Je moet deze command gebruiken in een server");
			return
		}

		let subscription = guildMusicSubscriptionMap.get(guild.id);

		const track = interaction.options.get('track')!.value! as string;
		let url: string | undefined = undefined;

		const ytRegex = /(.*youtu\.be.*)|(.*youtube\.com.*)/gm
		const isYtLink = track.match(ytRegex)
		if (isYtLink) {
			url = track
		} else {
			url = await fetchUrlFromSearchTerm(track)
		}

		if (!url) {
			await interaction.reply("Ik kan de track niet vinden :(")
			return;
		}

		// If a connection to the guild doesn't already exist and the user is in a voice channel, join that channel
		// and create a subscription.
		if (!subscription) {
			if (interaction.member instanceof GuildMember && interaction.member.voice.channel) {
				const channel = interaction.member.voice.channel;
				subscription = new MusicSubscription(
					joinVoiceChannel({
						channelId: channel.id,
						guildId: channel.guild.id,
						adapterCreator: channel.guild.voiceAdapterCreator,
					}),
				);
				subscription.voiceConnection.on('error', console.warn);
				guildMusicSubscriptionMap.set(guild.id, subscription);
			}
		}

		// If there is no subscription, tell the user they need to join a channel.
		if (!subscription) {
			await interaction.followUp('Je moet wel in een voice kanaal zitten!');
			return;
		}

		// Make sure the connection is ready before processing the user's request
		try {
			await entersState(subscription.voiceConnection, VoiceConnectionStatus.Ready, 20e3);
		} catch (error) {
			console.warn(error);
			await interaction.followUp('Ik kon de voice channel niet joinen binnen 20 seconden :(');
			return;
		}

		try {
			// Attempt to create a Track from the user's video URL
			const track = await Track.from(url, {
				onStart() {
					interaction.followUp({ content: `Ik speel nu: **${track.title}**` }).catch(console.warn);
				},
				onFinish() { },
				onError(error) {
					log.warn(error);
					interaction.followUp("Huh, er ging iets fout!").catch(console.warn);
				},
			});
			// Enqueue the track and reply a success message to the user
			subscription.enqueue(track);
			if (subscription.audioPlayer.state.status != AudioPlayerStatus.Idle) {
				await interaction.followUp(`Track **"${track.title}"** is aan de queue toegevoegd!`);
			}
		} catch (error) {
			console.warn(error);
			await interaction.reply('Ik kon de track niet afspelen... probeer het later nog eens!!');
		}
	},
};

async function fetchUrlFromSearchTerm(searchTerm: string) {
	const result: SearchResult = await yts(searchTerm)
	const video = result.videos[0]
	if (video) {
		return result.videos[0].url
	} else {
		return undefined
	}
}

// function playYoutubeLink(url: string, args: string[], message: Message, guild: Guild, voiceChannel: VoiceChannel) {
//     // Validate the start time, if given
//     const startTimestamp = args.shift()
//     if (startTimestamp) {
//         const minute = startTimestamp.split(":")[0]
//         const second = startTimestamp.split(":")[1]

//         if (Number.isNaN(parseInt(minute)) || Number.isNaN(parseInt(second))) {
//             return message.channel.send("Er ging wat mis met het parsen van de starttijd... Weet je wel wat je doet?");
//         }
//     }

//     // Get song info
//     ytdl.getInfo(url).then(response => {

//         let startSeconds = 0;
//         if (startTimestamp) {
//             const minute = startTimestamp.split(":")[0]
//             const second = startTimestamp.split(":")[1]
//             startSeconds = parseInt(minute) * 60 + parseInt(second)
//         }

//         // Extract video info from response
//         const videoDetails: MoreVideoDetails = response.videoDetails;
//         const song: Song = {
//             title: videoDetails.title,
//             url: videoDetails.video_url,
//             lengthSeconds: videoDetails.lengthSeconds,
//             viewCount: videoDetails.viewCount,
//             startTimeSeconds: startSeconds
//         };

//         const track = await Track.from(url, {
//             onStart() {
//                 interaction.followUp({ content: 'Now playing!', ephemeral: true }).catch(console.warn);
//             },
//             onFinish() {
//                 interaction.followUp({ content: 'Now finished!', ephemeral: true }).catch(console.warn);
//             },
//             onError(error) {
//                 console.warn(error);
//                 interaction.followUp({ content: `Error: ${error.message}`, ephemeral: true }).catch(console.warn);
//             },
//         });
//         let queueConstruct = guildMusicSubscriptionMap.get(guild.id);
//         if (!queueConstruct) {
//             // Creating the contract for our queue
//             queueConstruct = getEmptyQueueConstruct()
//             queueConstruct.textChannel = message.channel as TextChannel
//             guildMusicSubscriptionMap.set(guild.id, queueConstruct)
//         }

//         // Pushing the song to our songs array
//         queueConstruct.songs.push(song);

//         if (queueConstruct.songs.length > 1) {
//             message.channel.send(
//                 `**${song.title}** is aan de queue toegevoegd!`
//             );
//         }

//         try {
//             // Attempt to join voice channel and set the connection in the queue construct\
//             joinVoiceChannel({
//                 guildId: guild.id,
//                 channelId: message.channel!.id,
//                 adapterCreator: guild.voiceAdapterCreator
//             }).on
//             voiceChannel.join().then(connection => {
//                 queueConstruct!.connection = connection;
//                 queueConstruct!.voiceChannel = voiceChannel;
//                 // Calling the play function to start a song

//                 if (!queueConstruct!.playing) playSong(guild, queueConstruct!.songs[0]);
//             });
//         } catch (err) {
//             // Printing the error message if the bot fails to join the voicechat
//             log.error(err);
//             guildMusicSubscriptionMap.delete(guild.id);
//             return message.channel.send("Er ging iets fout bij het joinen van de voicechat...");
//         }
//     })
//         .catch(error => {
//             log.error("Er ging wat fout bij het toevoegen van een liedje aan de queue:", error)
//             message.channel.send("Er ging wat fout bij het toevoegen van het liedje aan de lijst... :(")
//         });
// }

// function playSong(guild: Guild, song: Song) {
//     const guildMusicQueue = guildMusicSubscriptionMap.get(guild.id)!;

//     const voiceConnection = guildMusicQueue.connection;

//     if (song) {
//         if (!voiceConnection) {
//             return log.error("Could not find a voice connection for guild: ", guild)
//         }

//         const audioStream = ytdl(song.url, { quality: "highestaudio" });

//         const dispatcher = voiceConnection
//             .play(audioStream, { seek: song.startTimeSeconds })
//             .on("start", () => {
//                 guildMusicQueue.playing = true;
//                 dispatcher.setVolumeLogarithmic(guildMusicQueue.volume / 5);
//                 guildMusicQueue.textChannel?.send(`Ik speel nu: **${song.title}**`);
//                 log.info(`Battiebot is playing a song in ${guild.name}: ${song.title}`);
//             })
//             .on("finish", () => {
//                 guildMusicQueue.songs.shift();
//                 guildMusicQueue.playing = false;
//                 playSong(guild, guildMusicQueue.songs[0]);
//             })
//             .on("error", (error: any) => console.error(error));

//         guildMusicQueue.audioPlayer = dispatcher;
//     }
// }
