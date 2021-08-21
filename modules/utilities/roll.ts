import { Message, User } from "discord.js";
import { Command } from "../../models/Command";

const COMMAND = "roll"

export const roll: Command = {
    name: COMMAND,
    format: `${COMMAND} [X] [Y]`,
    description: "Rolt een willekeurig getal tussen 0 en 100.\n\t" + 
        "Als `x` is meegegeven, rolt een willekeurig getal tussen 0 en `x`\n\t" +
        "Als `y` ook is meegegeven, rolt een willekeurig getal tussen `x` en `y`",
    execute(message, args) {

        const author: User = message.author;
        const x: string | undefined = args.shift();
        const y: string | undefined = args.shift();

        if (validInputs(x, y)) {
            let number = 0;
            if (x == null && y == null) {
                number = rollRandomNumber(0, 100);
            } else if (x != null && y == null) {
                number = rollRandomNumber(0, parseInt(x));
            } else if (x != null && y != null) {
                number = rollRandomNumber(parseInt(x), parseInt(y));
            }
            sendMessage(message, author, number,)
        } else {            
            message.channel.send(`Wat denk je dat je aan het doen bent? Brozzer dit zijn geen hele getallen...`);
        }
    },
};

function sendMessage(message: Message, author: User, number: number) {
    const listOfVariants = [messageVariant1, messageVariant2, messageVariant3]
    const chosenVariant = listOfVariants[Math.floor(Math.random() * listOfVariants.length)];
    message.channel.send(chosenVariant(author, number));
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
