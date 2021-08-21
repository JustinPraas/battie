import { Collection, GuildMember, Message, Snowflake, User } from "discord.js";
import { Command } from "../../models/Command";

const COMMAND = "roulette"

export const userRoulette: Command = {
    name: COMMAND,
    format: `\`${COMMAND} [@user1] [@user2] ...\` of \`${COMMAND} [naam1] [naam2]...\``,
    description: "Kiest een willekeurige gebruiker uit de aangegeven lijst van gebruikers.",
    execute(message, args) {
        
        const users: Collection<Snowflake, GuildMember> | null = message.mentions.members;

        if (users) {
            if (users.size == 0) {
                const names = args
                const chosenName = names[Math.floor(Math.random() * names.length)];
                sendMessageStrings(message, chosenName);
            } else {
                const usersArray = users.map(gm => gm.user);
                const chosenUser = usersArray[Math.floor(Math.random() * usersArray.length)];
                sendMessageMentions(message, chosenUser);
            }
        } else {
            message.channel.send("Er is wat fout gegaan en ik heb geen idee wat. Probeer het opnieuw questionmark?")
        }
    },
};

function sendMessageStrings(message: Message, chosenPerson: string) {
    message.channel.send(getMessageVariant()(chosenPerson));
}

function sendMessageMentions(message: Message, chosenUser: User) {
    message.channel.send(getMessageVariant()(getMention(chosenUser)));
}

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