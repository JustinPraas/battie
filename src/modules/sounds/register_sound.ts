import { battieDb } from "../../main/mongodb";
import { Command } from "../../models/Command";

export const registerSound: Command = {         
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
        }]
    },
    async execute(interaction) {
        const guild = interaction.guild;

        if (!guild) {
            await interaction.reply(
                "Dit kan je alleen in een server uitvoeren"
            );
            return
        }

		const name = interaction.options.get('name')!.value! as string;
		const url = interaction.options.get('url')!.value! as string;

        if (battieDb) {
            const collection = battieDb.collection("soundregistrations");
            const exists = (await collection.find({name: name, guildId: guild.id}).count()) > 0
            
            if (exists) {
                await interaction.reply("Een sound met deze naam bestaat al...")
                return
            }

            const acknowledged = (await collection.insertOne({name: name, guildId: guild.id, url: url})).acknowledged
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