import { CommandInteraction, User } from "discord.js";
import { Command } from "../../models/Command";

export const userRoulette: Command = {
    command: {
        name: 'roulette',
        description: 'Kiest een willekeurige gebruiker uit de aangegeven lijst van users',
        options: [
            {
                name: 'users',
                type: 'STRING' as const,
                description: 'De users, gesplits door een komma',
                required: true,
            }],
    },
    async execute(interaction, _1, _2) {
        const usersArg = interaction.options.get("users")?.value as string
        const users = usersArg.split("<@!").map(s => "<@!" + s).slice(1)
        const names = usersArg.split(" ")
        if (users.length > 0) {
            const chosenUser = users[Math.floor(Math.random() * users.length)];
            sendMessageStrings(interaction, chosenUser);
        } else if (names.length > 0) {
            const chosenName = names[Math.floor(Math.random() * names.length)];
            sendMessageStrings(interaction, chosenName);
        } else {
            await interaction.reply("Geef eens een aantal opties mee...")
            return;
        }
    },
};

async function sendMessageStrings(interaction: CommandInteraction, chosenPerson: string) {
    await interaction.reply(getMessageVariant()(chosenPerson));
}

// async function sendMessageMentions(interaction: CommandInteraction, chosenUser: string) {
//     await interaction.reply(getMessageVariant()(getMention(chosenUser)));
// }

const getMessageVariant = () => MESSAGE_VARIANTS[Math.floor(Math.random() * MESSAGE_VARIANTS.length)];

const messageVariant1 = (chosenName: string): string => {
    return `Jaja, ${chosenName} is de gelukkige!`
}

const messageVariant2 = (chosenName: string): string => {
    return `${chosenName} mag de afwas doen.`
}

const messageVariant3 = (chosenName: string): string => {
    return `${chosenName} heeft gewonnen. Hoppa`
}

const getMention = (author: User) => {
    return `<@${author}>`
}

const MESSAGE_VARIANTS = [messageVariant1, messageVariant2, messageVariant3]