import { DMChannel, Message, NewsChannel, TextChannel, User } from "discord.js";
import { Job, RecurrenceRule, scheduleJob } from "node-schedule";
import { battieDb, client, log } from "../../main";
import { Command } from "../../models/Command";
import { getFriendlyDate, sleep } from "../../utils";
import { RemindMeDocument } from "./reminders-module";

const COMMAND = "remindme";

export const activeRemindersMap = new Map<string, Job>();

export const remindMe: Command = {
    name: COMMAND,
    format: `${COMMAND} <in | on> <x days/minutes/hours/seconds | date and time>; <content>`,
    description:
        "Helpt je herinneren aan iets op de gegeven datum en/of tijd. Als er geen datum is gegeven, dan wordt je herinnert op de eerst volgende instantie van <time>. Als er geen tijd is gegeven, dan wordt je herinnert op de aangegeven dag op de tijd herinnert waarop je de herinnering hebt aangemaakt.",
    execute(message, args) {
        const atOrOn = args.shift();

        if (atOrOn != "in" && atOrOn != "on") {
            message.channel.send(
                `Ik snap je command niet. Gebruik het volgende formaat: ${this.format}`
            );
        }

        // Dissect command parts
        const user: User = message.author;
        const argsCombined = args.join(" ");
        const dateAndTimePart = argsCombined.split(";")[0];
        const content = argsCombined.split(";")[1];

        if (!content || content.length == 0) {
            return message.channel.send("Waar wil je aan herinnerd worden???");
        }

        if (atOrOn == "on") {
            scheduleOn(message, user, dateAndTimePart, content);
        } else if (atOrOn == "in") {
            scheduleIn(message, user, dateAndTimePart, content);
        }
    },
};

const ACCEPTED_DAYS_STRINGS = ["days", "dagen", "d", "day", "dag"];
const ACCEPTED_HOURS_STRINGS = ["hours", "uren", "h", "u", "uur", "hour"];
const ACCEPTED_MINUTES_STRINGS = ["minutes", "minuten", "mins", "min", "m", "minuut", "minute"];
const ACCEPTED_SECONDS_STRINGS = ["seconds", "seconden", "s", "secondes", "seconde", "second", "sec"];
function scheduleIn(
    message: Message,
    user: User,
    dateAndTimePart: string,
    content: string
) {
    const scheduleTimeBuilder = new Date(Date.now());
    const regex = /(\d*\s[a-z]+)+/gm;
    let match = dateAndTimePart.match(regex);

    if (match) {
        match = match.filter((value) => value != "");
        for (let i = 0; i < match.length; i++) {
            const m = match[i];
            const number = parseInt(m.split(" ")[0]);
            const quantifier = m.split(" ")[1];

            if (ACCEPTED_DAYS_STRINGS.includes(quantifier)) {
                scheduleTimeBuilder.setDate(
                    scheduleTimeBuilder.getDate() + number
                );
            } else if (ACCEPTED_HOURS_STRINGS.includes(quantifier)) {
                scheduleTimeBuilder.setTime(
                    scheduleTimeBuilder.getTime() + number * 60 * 60 * 1000
                );
            } else if (
                ACCEPTED_MINUTES_STRINGS.includes(quantifier)
            ) {
                scheduleTimeBuilder.setTime(
                    scheduleTimeBuilder.getTime() + number * 60 * 1000
                );
            } else if (ACCEPTED_SECONDS_STRINGS.includes(quantifier)) {
                scheduleTimeBuilder.setTime(
                    scheduleTimeBuilder.getTime() + number * 1000
                );
            } else {
                return message.channel.send(
                    "Er is helaas toch iets fout gegaan bij het verwerken van de data"
                );
            }
        }

        scheduleRemindMe(scheduleTimeBuilder, content, user, message.channel);
    }
}

function scheduleOn(
    message: Message,
    user: User,
    dateAndTimePart: string,
    content: string
) {
    const parsedDateTime = new Date(Date.parse(dateAndTimePart));
    if (parsedDateTime && !Number.isNaN(parsedDateTime)) {
        scheduleRemindMe(parsedDateTime, content, user, message.channel);
    } else {
        return message.channel.send(
            "Ik kan je gegeven datum en tijd helaas niet verwerken. Probeer eens hetvolgende:\n" +
                "```\n" +
                `\$${COMMAND} aug 7 2021, 18:32; zet de container aan de weg \n` +
                "```"
        );
    }
}

function scheduleRemindMe(
    date: Date,
    content: string,
    user: User,
    channel: TextChannel | DMChannel | NewsChannel
) {
    const randomString = (
        Math.random().toString(36).substring(5, 15) +
        Math.random().toString(36).substring(10, 15)
    ).substring(0, 5);
    const remindMeDocument: RemindMeDocument = {
        id: randomString,
        discordId: user.id,
        channelId: channel.id,
        content: content.trim(),
        timestamp: date.getTime(),
    };

    if (battieDb) {
        const collection = battieDb.collection("reminders");
        collection.insertOne(remindMeDocument).then((response) => {
            if (response.acknowledged) {
                scheduleJobForRemindMe(
                    randomString,
                    date,
                    channel,
                    user,
                    content,
                    true
                );
            } else {
                channel.send(
                    "Er is wat mis gegaan bij het opslaan van de remindme..."
                );
            }
        });
    }
}

function scheduleJobForRemindMe(
    id: string,
    date: Date,
    channel: TextChannel | DMChannel | NewsChannel,
    user: User,
    content: string,
    sendMessage: boolean
) {
    const job = scheduleJob(date, () =>
        channel.send(
            `<@${user}>, ik heb een herinnering voor je: **${content}**`
        )
    );

    activeRemindersMap.set(id, job);

    if (sendMessage) {
        const timezoneOffsetHours = date.getTimezoneOffset() / -60;
        channel.send(
            `Komt voor de bakker. Reminder staat gescheduled op **${getFriendlyDate(
                date
            )}** (UTC ${timezoneOffsetHours > 0 ? "+" + timezoneOffsetHours : timezoneOffsetHours})`
        );
    }

    log.info(
        `Scheduled a reminder for user ${user.username} on ${date}: ${content}`
    );
}

export async function instantiateSchedulesFromDatabase() {
    // Wait for database connection to establish
    while (!battieDb) {
        await sleep(1000);
    }

    // Purge now and every hour
    purgeOutdatedReminders();
    const rule = new RecurrenceRule();
    rule.minute = 0;
    scheduleJob(rule, () => purgeOutdatedReminders);

    // Schedule all stored reminders if the date and time is greater than Date.now()
    const collection = battieDb.collection("reminders");
    const reminders = collection.find();
    reminders
        .map((it) => it as RemindMeDocument)
        .forEach((reminder: RemindMeDocument) => {
            const date = new Date(reminder.timestamp);

            if (date > new Date(Date.now())) {
                const content = reminder.content;
                const userPromise = client.users.fetch(reminder.discordId);
                const channelPromise = client.channels.fetch(
                    reminder.channelId
                );

                Promise.all([userPromise, channelPromise])
                    .then((results: any[]) => {
                        const user: User = results[0];
                        const channel: TextChannel | DMChannel | NewsChannel =
                            results[1];
                        scheduleJobForRemindMe(
                            reminder.id,
                            date,
                            channel,
                            user,
                            content,
                            false
                        );
                    })
                    .catch((err) => {
                        log.error(
                            "Could not initially schedule reminder:",
                            reminder,
                            err
                        );
                    });
            }
        });
}

function purgeOutdatedReminders() {
    if (battieDb) {
        const collection = battieDb.collection("reminders");
        const nowMillis = Date.now();
        collection
            .deleteMany({ timestamp: { $lt: nowMillis } })
            .then((result) => {
                if (result.deletedCount > 0)
                    log.info(
                        `Purged ${result.deletedCount} outdated reminders`
                    );
            });
    }
}
