import { Client, User } from "discord.js";
import { RecurrenceRule, scheduleJob } from "node-schedule";
import { log } from "../../main";
import { Command } from "../../models/Command";

const COMMAND = "hydration"

const subscribers: User[] = []

export const hydration: Command = {
    name: COMMAND,
    format: `\`${COMMAND} [un]subscribe`,
    description: "Meld jou aan/af voor de hourly hydration reminder",
    execute(message, args) {

        const subParam = args.shift()
        const user: User = message.author;

        if (subParam == "subscribe") {
            if (subscribers.indexOf(user) != -1) {
                message.channel.send("Je bent al gesubscribed op de hydration reminder!");
            } else {
                subscribers.push(user);
                message.channel.send("Je hebt gesubscribed op de hydration reminder. Stay hydrated :)")
            }
        } else if (subParam == "unsubscribe") {
            if (subscribers.indexOf(user) == -1) {
                message.channel.send("Je was niet eens gesubscribed op de hydration reminder!");
            } else {
                const index = subscribers.indexOf(user);
                subscribers.splice(index);
                message.channel.send("Je bent niet meer gesubscribed op de hydration reminder. Droog niet uit")
            }
        } else {
            message.channel.send("Wat wil je dat ik doe?");
        }
    },
};

export function startSchedulingHydrationReminders(client: Client) {    
    const rule = new RecurrenceRule();
    rule.minute = 0;
    scheduleJob(rule, function () {
        log.info("Reminding all subscribers to hydrate.");

        subscribers.forEach(sub => {
            client.users.cache.get(sub.id)?.send("Hydration Reminder: drink ongeveer 200-300ml water!")
        });
    });
}