import { AudioPlayerStatus, entersState, joinVoiceChannel, VoiceConnectionStatus } from "@discordjs/voice";
import { GuildMember } from "discord.js";
import yts, { SearchResult } from "yt-search";
import { log } from "../../process/main";
import { Command } from "../../models/Command";
import { MusicSubscription } from "../../models/MusicSubscription";
import { Track } from "../../models/Track";
import { guildMusicSubscriptionMap } from "./_music-commands";

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
	async execute(interaction, guild, _) {
		await interaction.deferReply()

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
			await interaction.followUp("Ik kan de track niet vinden :(")
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
			await interaction.followUp('Ik kon de track niet afspelen... probeer het later nog eens!!');
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
