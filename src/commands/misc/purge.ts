import { Command } from "../../models/Command";

export const purge: Command = {
    command:
    {
        name: 'purge-messages',
        description: 'Verwijdert het aangegeven aantal messages in dit kanaal',
        options: [
            {
                name: 'quantity',
                type: 'INTEGER' as const,
                description: 'Het aantal messages dat je wilt verwijderen (max 5 per keer)',
                required: true,
            }
        ],
    },
    async execute(interaction, _1, _2) {

        const quantity = interaction.options.getInteger("quantity")

        if (quantity! > 5) {
            await interaction.reply("Om veiligheidsredenen kan je maar maximaal 5 berichten per keer verwijderen... :)")
            return
        }

        const channel = interaction.channel

        const messages = await channel!.messages.fetch({ limit: quantity! })
        channel!.messages.fetch({})

        await interaction.reply("On it...")

        messages.forEach(message => {
            message.delete()
        })
    },
};
