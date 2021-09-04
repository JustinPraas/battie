import { battieDb } from "../../main/mongodb";
import { Command } from "../../models/Command";

const gdriveRegex = /https:\/\/(drive\.google\.com\/file\/d)(.*)(\/view\?usp=sharing)/gm

export const deleteSound: Command = {
    command:
    {
        name: 'delete-sound',
        description: 'Verwijdert een sound',
        options: [{
            name: 'name',
            type: 'STRING' as const,
            description: 'De naam van de sound die je wilt updaten',
            required: true,
        }]
    },
    async execute(interaction, guild, _) {

        const name = interaction.options.get('name')!.value! as string;

        if (battieDb) {
            const collection = battieDb.collection("soundregistrations");
            const document = await collection.findOne({ name: name, guildId: guild.id })
            const exists = document != null

            if (!exists) {
                await interaction.reply("Er bestaat geen sound met deze naam...")
                return
            }

            const acknowledged = (await collection.deleteOne({ name: name, guildId: guild.id })).acknowledged

            if (acknowledged) {
                await interaction.reply(`De sound *${name}* is verwijdert!`)
                return
            } else {
                await interaction.reply("De sound kon om een onbekende reden niet geupload worden... :(")
                return
            }
        }

    },
};