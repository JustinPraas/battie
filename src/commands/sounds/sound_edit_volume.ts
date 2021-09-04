import { battieDb } from "../../process/mongodb";
import { Command } from "../../models/Command";
import { VOLUME_CHOICES } from "./_sound-commands";

export const soundEditVolume: Command = {
    command:
    {
        name: 'edit-sound-volume',
        description: 'Verandert het volume van de sound',
        options: [{
            name: 'name',
            type: 'STRING' as const,
            description: 'De naam van de sound die je wilt updaten',
            required: true,
        },
        {
            choices: VOLUME_CHOICES,
            name: 'new-volume',
            type: 'NUMBER' as const,
            description: 'Geeft het aangepaste volume aan van de track',
            required: true,
        },
        ]
    },
    async execute(interaction, guild, user) {
        const name = interaction.options.get('name')!.value! as string;
        const volume = interaction.options.getNumber("new-volume")

        if (battieDb) {
            const collection = battieDb.collection("soundregistrations");
            const document = await collection.findOne({ name: name, guildId: guild.id })
            const exists = document != null

            if (!exists) {
                await interaction.reply("Er bestaat geen sound met deze naam")
                return
            }

            const acknowledged = (await collection.updateOne({ name: name, guildId: guild.id }, {
                $set: {
                    name: document.name,
                    guildId: document.guildId,
                    url: document.url,
                    registeredBy: document.registeredBy,
                    registeredAt: document.registeredAt,
                    volume: volume ? volume : document.volume,
                    lastModifiedAt: Date.now(),
                    lastModifiedBy: user.username
                }
            })).acknowledged

            if (acknowledged) {
                await interaction.reply("De sound is geupdate!")
                return
            } else {
                await interaction.reply("De sound kon om een onbekende reden niet geupload worden... :(")
                return
            }
        }

    },
};