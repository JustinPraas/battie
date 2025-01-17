import { battieDb } from "../../process/mongodb";
import { Command } from "../../models/Command";
import { DEFAULT_VOLUME, RANDOM_SOUND_NAME, VOLUME_CHOICES } from "./_sound-commands";

const gdriveRegex = /https:\/\/(drive\.google\.com\/file\/d)(.*)(\/view\?usp=sharing)/gm

export const soundRegister: Command = {
    command:
    {
        name: 'register-sound',
        description: 'Registreer een sound',
        options: [{
            name: 'name',
            type: 'STRING' as const,
            description: 'De naam die je de sound wil geven',
            required: true,
        },
        {
            name: 'url',
            type: 'STRING' as const,
            description: 'De url die naar de sound verwijst',
            required: true,
        },
        {
            name: 'gdrive',
            type: 'BOOLEAN' as const,
            description: 'Geeft aan of dit een google drive share-url is',
            required: false,
        },
        {
            choices: VOLUME_CHOICES,
            name: 'volume',
            type: 'NUMBER' as const,
            description: 'Geeft het volume aan van de track',
            required: false,
        },
    ]
    },
    async execute(interaction, guild, user) {
        const name = interaction.options.get('name')!.value! as string;
        let url = interaction.options.get('url')!.value! as string;
        const gdrive = interaction.options.getBoolean("gdrive")
        const volume = interaction.options.getNumber("volume")

        if (name === RANDOM_SOUND_NAME) {
            await interaction.reply(`Je sound kan niet de naam *${RANDOM_SOUND_NAME}* hebben`)
            return
        }

        if (battieDb) {
            const collection = battieDb.collection("soundregistrations");
            const exists = (await collection.find({ name: name, guildId: guild.id }).count()) > 0

            if (exists) {
                await interaction.reply("Een sound met deze naam bestaat al...")
                return
            }

            if (gdrive) {
                if (url.match(gdriveRegex)?.length != 1) {
                    await interaction.reply("De google drive url is niet geldig... Zorg dat je een publieke share-url gebruikt!")
                    return
                } else {
                    url = url.replace("file/d/", "uc?id=")
                    url = url.replace("/view?usp=sharing", "&export=download")
                }
            }

            const acknowledged = (await collection.insertOne({
                name: name,
                guildId: guild.id,
                url: url,
                volume: volume ? volume : DEFAULT_VOLUME,
                registeredBy: user.username,
                registeredAt: Date.now(),
                lastModifiedAt: null,
                lastModifiedBy: null
            })).acknowledged

            if (acknowledged) {
                await interaction.reply("De sound is geupload!")
                return
            } else {
                await interaction.reply("De sound kon om een onbekende reden niet geupload worden... :(")
                return
            }
        }

    },
};