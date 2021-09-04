import { CommandInteraction, User } from "discord.js";
import { Command } from "../../models/Command";

export const roll: Command = {
    command: {
        name: 'roll',
        description: 'Rolt een willekeurig getal tussen [1, 100] of de aangegeven bounds',
        options: [
            {
                name: 'x',
                type: 'STRING' as const,
                description: 'Mits meegegeven, gooi [1, x]',
                required: false,
            },
            {
                name: 'y',
                type: 'STRING' as const,
                description: 'Mits ook meegegeven, gooi [x, y]',
                required: false,
            },
        ],
    },
    async execute(interaction, _, user) {
        const x: string | undefined = interaction.options.get('x')?.value! as string;
        const y: string | undefined = interaction.options.get('y')?.value! as string;

        if (validInputs(x, y)) {
            let number = 0;
            if (x == null && y == null) {
                number = rollRandomNumber(1, 100);
            } else if (x != null && y == null) {
                number = rollRandomNumber(1, parseInt(x));
            } else if (y != null && x == null) {
                number = rollRandomNumber(1, parseInt(y));
            } else if (x != null && y != null) {
                number = rollRandomNumber(parseInt(x), parseInt(y));
            }
            sendMessage(interaction, user, number)
        } else {
            await interaction.reply(`Wat denk je dat je aan het doen bent? Brozzer dit zijn geen hele getallen...`);
            return;
        }
    },
};

async function sendMessage(interaction: CommandInteraction, author: User, number: number) {
    const listOfVariants = [messageVariant1, messageVariant2, messageVariant3]
    const chosenVariant = listOfVariants[Math.floor(Math.random() * listOfVariants.length)];
    await interaction.reply(chosenVariant(author, number));
}

const validInputs = (x: string | undefined, y: string | undefined): boolean => {
    const validX = x == undefined || !Number.isNaN(parseInt(x));
    const validY = y == undefined || !Number.isNaN(parseInt(y));

    return validX && validY;
}

const rollRandomNumber = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const messageVariant1 = (author: User, number: Number): string => {
    return `Wow.. ${getMention(author)} rolt een **${number}**. Is dat goed?`
}

const messageVariant2 = (author: User, number: Number): string => {
    return `${getMention(author)} rolt een **${number}**. Doe dat maar eens na`
}

const messageVariant3 = (author: User, number: Number): string => {
    return `Brozzer ${getMention(author)} rolde **${number}**. Ezpz`
}

const getMention = (author: User) => {
    return `<@${author}>`
}
