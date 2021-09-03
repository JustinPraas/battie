import { commandList, COMMAND_PREFIX } from "../../main/discord";
import { Command } from "../../models/Command";

const COMMAND = "help"

export const help: Command = {
    name: COMMAND,
    format: `${COMMAND} [command_name]`,
    description: "Geeft een overzicht van alle beschikbare commands.",
    execute(message, args) {
        const commandName = args.shift();

        // Als een command name is meegegeven, geef een overzicht van dat command
        if (commandName) {
            const command = commandList.find((c) => c.name === commandName);

            if (!command) {
                message.channel.send(
                    `Er is helaas geen command met de naam ${commandName}. Probeer een andere command.`
                );
                return;
            } else {
                let printString = "```";
                printString += `Command naam:   \t ${command.name}\n`;
                printString += `Command format: \t ${command.format}\n`;
                printString += `Beschrijving:   \t ${command.description}\n`;
                printString += "```";

                message.channel.send(printString);
            }
        }

        // Anders geef een overzicht van alle commands
        else {
            let printString = "```";
            printString += `Voor een uitgebreid overzicht van de verschillende commands, gebruik ${COMMAND_PREFIX}help <command_name>\n\n`;

            commandList.forEach((c) => {
                const paddedCommandName = c.name.padEnd(15)
                printString += `${paddedCommandName}\n`;
            });

            printString += "```";

            message.channel.send(printString);
        }
    },
};
