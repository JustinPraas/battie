import { Collection, GuildMember, Message, Snowflake, User } from "discord.js";
import { Command } from "../../models/Command";

const COMMAND = "roulette"

export const userRoulette: Command = {
    name: COMMAND,
    format: `${COMMAND} [@user1] [@user2] ...`,
    description: "Kiest een willekeurige gebruiker uit de aangegeven lijst van gebruikers.",
    execute(message, args) {
        
        const users: Collection<Snowflake, GuildMember> | null = message.mentions.members;

        if (users) {
            if (users.size == 0) {
                message.channel.send("Uuuh.. niemand is gementioned?")
            } else {
                const usersArray = users.map(gm => gm.user);
                const chosenUser = usersArray[Math.floor(Math.random() * usersArray.length)];
                sendMessage(message, chosenUser);
            }
        } else {
            message.channel.send("Er is wat fout gegaan en ik heb geen idee wat. Probeer het opnieuw questionmark?")
        }
    },
};

function sendMessage(message: Message, chosenUser: User) {
    const listOfVariants = [messageVariant1, messageVariant2, messageVariant3]
    const chosenVariant = listOfVariants[Math.floor(Math.random() * listOfVariants.length)];
    message.channel.send(chosenVariant(chosenUser));
}

const messageVariant1 = (chosenUser: User): string => {
    return `Jaja, ${getMention(chosenUser)} is de gelukkige!`
}

const messageVariant2 = (chosenUser: User): string => {
    return `${getMention(chosenUser)} mag de afwas doen.`
}

const messageVariant3 = (chosenUser: User): string => {
    return `${getMention(chosenUser)} heeft gewonnen. Hoppa`
}

const getMention = (author: User) => {
    return `<@${author}>`
}
