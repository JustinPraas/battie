import { TextBasedChannels } from "discord.js";
import { log } from "../../main/main";
import { Command } from "../../models/Command";

const emojis = ["🇦", "🇧", "🇨", "🇩", "🇪", "🇫", "🇬", "🇭", "🇮", "🇯", "🇰", "🇱", "🇲", "🇳", "🇴", "🇵", "🇶", "🇷", "🇸", "🇹"]

export const poll: Command = {
    command: {
        name: 'poll',
        description: 'Start een meerkeuze poll met de gegeven keuze opties',
        options: [
            {
                name: 'options',
                type: 'STRING' as const,
                description: 'De opties, gesplitst met een comma',
                required: true,
            }],
    },
    async execute(interaction, guild) {
        const optionsArg = interaction.options.get('options')!.value! as string;
        const options: string[] = optionsArg.split(",").map(option => option.trim());

        if (options.length > 20) {
            await interaction.reply("Dit zijn teveel opties.. Je mag maar 20 opties gebruiken!")
            return
        }

        let messageString = "Kies uit de volgende opties:";
        let usedEmojis: string[] = [];
        for (let i = 0; i < options.length; i++) {
            const emoji: string = emojis[i]
            const option: string = options[i]
            usedEmojis.push(emoji);
            messageString += `\n${emoji} - ${option}`;
        };

        const channel = interaction.channel as TextBasedChannels

        const message = await channel.send(`${messageString}`);
        usedEmojis.forEach(e => {
            if (e) {
                message.react(e)
            } else {
                log.error("Could not find emoji with ID", e, "in guild", guild.name);
            }
        });

        await interaction.reply("Oké 👍")
    },
};