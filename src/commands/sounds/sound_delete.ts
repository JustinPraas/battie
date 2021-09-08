import { battieDb } from "../../process/mongodb";
import { Command } from "../../models/Command";
import { isModerator } from "../../util/utils";

export const soundDelete: Command = {
    command:
    {
        name: 'delete-sound',
        description: 'Verwijderd een sound',
        options: [{
            name: 'name',
            type: 'STRING' as const,
            description: 'De naam van de sound die je wilt updaten',
            required: true,
        }]
    },
    async execute(interaction, guild, user) {

        const name = interaction.options.get('name')!.value! as string;

        if (battieDb) {
            const collection = battieDb.collection("soundregistrations");
            const document = await collection.findOne({ name: name, guildId: guild.id })
            const exists = document != null

            if (!exists) {
                await interaction.reply("Er bestaat geen sound met deze naam...")
                return
            }

            if (!(isModerator(user) || document.userId == user.id)) {
                await interaction.reply("Je hebt niet de juiste bevoegdheden om dit te kunnen doen...")
                return
            }

            const acknowledged = (await collection.deleteOne({ name: name, guildId: guild.id })).acknowledged

            if (acknowledged) {
                await interaction.reply(`De sound *${name}* is verwijderd!`)
                return
            } else {
                await interaction.reply("De sound kon om een onbekende reden niet geupload worden... :(")
                return
            }
        }

    },
};