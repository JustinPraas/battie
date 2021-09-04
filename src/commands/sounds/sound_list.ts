import { battieDb } from "../../process/mongodb";
import { Command } from "../../models/Command";

export const soundList: Command = {         
    command:
    {
        name: 'list-sounds',
        description: 'Laat alle geregistreerde sounds zien',
    },
    async execute(interaction, guild, _) {

        if (battieDb) {
            const collection = battieDb.collection("soundregistrations");
            const sounds = await collection.find({guildId: guild.id})
            const noSounds = await sounds.count() == 0
            
            if (noSounds) {
                await interaction.reply("Er zijn geen geregistreerde sounds voor deze server...")
                return
            } else {
                let stringBuilder = "Dit zijn de geregistreerde sounds:"
                sounds.forEach(sound => {
                    stringBuilder += "\n*" + sound.name + "* " + sound.volume
                })
                .then(async () => {
                    await interaction.reply(stringBuilder);
                    return
                });
            }
        }    
    },
};