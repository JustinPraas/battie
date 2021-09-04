import { battieDb } from "../../main/mongodb";
import { Command } from "../../models/Command";

const gdriveRegex = /https:\/\/(drive\.google\.com\/file\/d)(.*)(\/view\?usp=sharing)/gm

export const editSound: Command = {
    command:
    {
        name: 'edit-sound',
        description: 'Registreer een sound',
        options: [{
            name: 'name',
            type: 'STRING' as const,
            description: 'De naam van de sound die je wilt updaten',
            required: true,
        },
        {
            name: 'new-name',
            type: 'STRING' as const,
            description: 'De naam die je de sound wil geven',
            required: false,
        },
        {
            name: 'new-url',
            type: 'STRING' as const,
            description: 'De url die naar de sound verwijst',
            required: false,
        },
        {
            name: 'gdrive',
            type: 'BOOLEAN' as const,
            description: 'Geeft aan of dit een google drive share-url is',
            required: false,
        }]
    },
    async execute(interaction, guild, user) {

        const name = interaction.options.get('name')!.value! as string;
        const newName = interaction.options.get('new-name')?.value! as string;
        let newUrl = interaction.options.get('new-url')?.value! as string;
        const gdrive = interaction.options.getBoolean("gdrive")

        if (battieDb) {
            const collection = battieDb.collection("soundregistrations");
            const document = await collection.findOne({ name: name, guildId: guild.id })
            const exists = document != null

            if (!exists) {
                await interaction.reply("Er bestaat geen sound met deze naam")
                return
            }

            if (!newUrl && !newName) {
                await interaction.reply("Je wilt dus eigenlijk niets veranderen? Doe even normaal...")
                return
            }

            if (newUrl) {
                if (gdrive) {
                    if (newUrl.match(gdriveRegex)?.length != 1) {
                        await interaction.reply("De google drive url is niet geldig... Zorg dat je een publieke share-url gebruikt!")
                        return
                    } else {
                        newUrl = newUrl.replace("file/d/", "uc?id=")
                        newUrl = newUrl.replace("/view?usp=sharing", "&export=download")
                    }
                }
            }

            const acknowledged = (await collection.updateOne({ name: name, guildId: guild.id }, {
                $set: {
                    name: newName ? newName : document.name,
                    guildId: document.guildId,
                    url: newUrl ? newUrl : document.url,
                    registeredBy: document.registeredBy,
                    registeredAt: document.registered,
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