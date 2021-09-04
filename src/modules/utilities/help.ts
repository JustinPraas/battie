import { commandList } from "../../main/discord";
import { Command } from "../../models/Command";

export const help: Command = {
    command: {
        name: 'help',
        description: 'Geeft een overzicht van alle beschikbare commands',
        options: [
            {
                name: 'command',
                type: 'STRING' as const,
                description: 'Geeft je gedetailleerde informatie over de gegeven command',
                required: false,
            },
        ],
    },
    async execute(interaction, _1, _2) {

        let commandName: string | undefined = undefined
        if (interaction.options.get('command'))
            commandName = interaction.options.get('command')!.value! as string;

        // Als een command name is meegegeven, geef een overzicht van dat command
        if (commandName) {
            const command = commandList.find((c) => c.command.name === commandName);

            if (!command) {
                await interaction.reply(
                    `Er is helaas geen command met de naam ${commandName}. Probeer een andere command.`
                );
                return;
            } else {
                let printString = "```";
                printString += `Command naam:   \t ${command.command.name}\n`;
                // printString += `Beschrijving:   \t ${command.command.description}\n`;
                printString += "```";

                await interaction.reply(printString);
                return;
            }
        }

        // Anders geef een overzicht van alle commands
        else {
            let printString = "";
            printString += `Voor een uitgebreid overzicht van de verschillende commands, gebruik \`/help <command>\`\n`;

            commandList.forEach((c) => {
                printString += `*${c.command.name}*\n`;
            });

            await interaction.reply(printString);
            return;
        }
    },
};
