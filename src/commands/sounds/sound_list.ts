import { battieDb } from "../../process/mongodb";
import { Command } from "../../models/Command";
import { MessageEmbed } from "discord.js";
import { Document } from "bson";
import { log } from "../../process/main";
import { BOT_MAIN_COLOR } from "../../util/constants";

export const soundList: Command = {
    command:
    {
        name: 'list-sounds',
        description: 'Laat alle geregistreerde sounds zien',
    },
    async execute(interaction, guild, _) {

        if (battieDb) {
            const collection = battieDb.collection("soundregistrations");
            const sounds = await collection.find({ guildId: guild.id }).toArray()
            const noSounds = await sounds.length == 0

            if (noSounds) {
                await interaction.reply("Er zijn geen geregistreerde sounds voor deze server...")
                return
            } else {
                interaction.channel?.send({embeds: [getEmbed(sounds)]})
                interaction.reply("Oke!")
            }
        }
    },
};

const THREE_DAY_MS = 3 * 24 * 60 * 60 * 1000
const getEmbed = (sounds: Document[]): MessageEmbed => {
    const cols: Document[][] = new Array(3)
    cols[0] = []
    cols[1] = []
    cols[2] = []

    let colIndex = 0
    sounds.sort((a, b) => a.name > b.name ? 1 : -1).forEach(sound => {
        cols[colIndex].push(sound)
        colIndex = (colIndex + 1) % 3
    });

    const stringCols: string[] = [] 

    for(let i = 0; i < cols.length; i++) {
        let stringBuilder = ""
        cols[i].forEach(sound => {
            const isNew = sound.registeredAt + THREE_DAY_MS > Date.now()
            stringBuilder += `${sound.name}${isNew ? " ✨" : ""}\n`
        })
        stringCols[i] = stringBuilder
    }

    const soundListEmbed = new MessageEmbed()
        .setColor(BOT_MAIN_COLOR)
        .setTitle('Beschikbare sounds om af te spelen')
        .addFields(
            { name: '\u200B', value: stringCols[0], inline: true },
            { name: '\u200B', value: stringCols[1], inline: true },
            { name: '\u200B', value: stringCols[2], inline: true },
        )
    return soundListEmbed
}