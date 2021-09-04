import { joinVoiceChannel } from "@discordjs/voice";
import { GuildMember, User } from "discord.js";
import { log } from "../../process/main";
import { Command } from "../../models/Command";
import { MusicSubscription } from "../../models/MusicSubscription";
import { guildMusicSubscriptionMap } from "./_music-commands";

export const disconnect: Command = {
    command: 
    {
        name: 'leave',
        description: 'De bot verlaat zijn voice channel',
    },
    async execute(interaction, guild, _) {
        const subscription = guildMusicSubscriptionMap.get(guild.id);

        if (subscription) {
			subscription.voiceConnection.destroy();
			guildMusicSubscriptionMap.delete(guild.id);
			await interaction.reply("Doei!");
		} else {
			await interaction.reply('Ik speel niets af in deze server!');
		}
    },
};

export const summon: Command = {    
    command: 
    {
        name: 'summon',
        description: 'Roept mij op in jouw voice channel',
    },
    async execute(interaction, guild, user) {
        const guildMember = guild.members.cache.get(user.id);
        if (!guildMember) {
            await interaction.reply(
                "Je bent volgens mij geen lid van deze server, hoe dan?"
            );
            return
        }

        let subscription = guildMusicSubscriptionMap.get(guild.id);
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
				subscription.voiceConnection.on('error', (error) => { log.warn(error) });
				guildMusicSubscriptionMap.set(guild.id, subscription);
                await interaction.reply("Hulloo")
			}
		}
    },
};
