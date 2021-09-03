import { GuildEmoji } from "discord.js";
import { log } from "../../main/main";
import { Command } from "../../models/Command";
import { shuffle } from "../../util/utils";

const COMMAND = "poll"

export const poll: Command = {
    name: COMMAND,
    format: `${COMMAND} optie-1 optie-2 [optie-3] ... [optie-n]`,
    description: "Start een meerkeuze poll met de gegeven keuze opties",
    execute(message, args) {
        const guild = message.guild

        if (!guild) {
            return message.channel.send("Helaas kan je alleen een poll starten in een server")
        }

        const options: string[] = args.join("").split(",").map(option => option.trim());
        const emojis = shuffle(guild.emojis.cache.map((value) => value));

        let messageString = "Kies uit de volgende opties:";
        let usedEmojis: GuildEmoji[] = [];
        options.forEach(option => {
            const emoji: GuildEmoji = emojis.shift();
            usedEmojis.push(emoji);
            messageString += `\n<:${emoji.name}:${emoji.id}> - ${option}`;
        });

        const messagePromise = message.channel.send(`${messageString}`);       
        
        messagePromise.then(message => {
            usedEmojis.forEach(e => {
                if (e) {
                    message.react(e)   
                } else {
                    log.error("Could not find emoji with ID", e, "in guild", guild.name);
                }       
            });
        })

    },
};