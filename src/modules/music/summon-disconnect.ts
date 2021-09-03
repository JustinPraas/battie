import { joinVoiceChannel } from "@discordjs/voice";
import { GuildMember, User } from "discord.js";
import { log } from "../../main/main";
import { Command } from "../../models/Command";
import { MusicSubscription } from "../../models/MusicSubscription";
import { guildMusicSubscriptionMap } from "./music-module";

export const disconnect: Command = {
    command: 
    {
        name: 'leave',
        description: 'De bot verlaat zijn voice channel',
    },
    async execute(interaction) {
        const guild = interaction.guild;

        if (!guild) {
            await interaction.reply(
                "Dit kan je alleen in een server uitvoeren"
            );
            return
        }

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
    async execute(interaction) {
        const guild = interaction.guild;
        const user: User = (interaction.member as GuildMember).user;

        if (!guild) {
            await interaction.reply(
                "Dit kan je alleen in een server uitvoeren"
            );
            return
        }

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
