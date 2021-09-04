import { DMChannel, NewsChannel, TextBasedChannels, TextChannel, User } from "discord.js";
import { InsertOneResult } from "mongodb";
import { Job, RecurrenceRule, scheduleJob } from "node-schedule";
import { discordClient } from "../../process/discord";
import { log } from "../../process/main";
import { battieDb } from "../../process/mongodb";
import { Command } from "../../models/Command";
import { sleep } from "../../util/utils";
import { RemindMeDocument } from "./_reminder-commands";

const COMMAND = "remindme";

export const activeRemindersMap = new Map<string, Job>();

export const remindMe: Command = {
    command:
    {
        name: 'remindme',
        description: 'Helpt je herinneren aan iets op de gegeven datum en/of tijd',
        options: [
            {
                choices: [
                    {
                        name: "in",
                        value: "in",
                    },
                    {
                        name: "on",
                        value: "on",
                    }
                ],
                name: 'type',
                type: 'STRING' as const,
                description: "Kies uit 'in' of 'on', afhankelijk van je bedoeling",
                required: true,
            },
            {
                name: 'timeindication',
                type: 'STRING' as const,
                description: 'De tijdsaanduiding voor de reminder',
                required: true,
            },
            {
                name: 'content',
                type: 'STRING' as const,
                description: 'Hetgene waarvoor je herinnerd wilt worden',
                required: true,
            },
        ],
    },
    async execute(interaction, _, user) {
        const atOrOn = interaction.options.get('type')!.value! as string;

        if (atOrOn != "in" && atOrOn != "on") {
            await interaction.reply(
                `Ik snap je command format niet.`
            );
        }

        const dateAndTimePart = interaction.options.get('timeindication')!.value! as string;
        const content = interaction.options.get('content')!.value! as string;

        if (!content || content.length == 0) {
            await interaction.reply("Waar wil je aan herinnerd worden???");
            return
        }

        let success = false
        if (atOrOn == "on") {
            success = await scheduleOn(interaction.channel!, user, dateAndTimePart, content);

            if (success) {
                await interaction.reply("Komt voor de bakker. Reminder staat gescheduled op " + dateAndTimePart)
                return
            }
        } else if (atOrOn == "in") {
            success = await scheduleIn(interaction.channel!, user, dateAndTimePart, content);

            if (success) {
                await interaction.reply("Komt voor de bakker. Reminder staat gescheduled over " + dateAndTimePart)
                return
            }
        }
    },
};

const ACCEPTED_DAYS_STRINGS = ["days", "dagen", "d", "day", "dag"];
const ACCEPTED_HOURS_STRINGS = ["hours", "uren", "h", "u", "uur", "hour"];
const ACCEPTED_MINUTES_STRINGS = ["minutes", "minuten", "mins", "min", "m", "minuut", "minute"];
const ACCEPTED_SECONDS_STRINGS = ["seconds", "seconden", "s", "secondes", "seconde", "second", "sec"];
function scheduleIn(
    channel: TextBasedChannels,
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
                channel.send(
                    "Er is helaas toch iets fout gegaan bij het verwerken van de data"
                );
                return Promise.resolve(false)
            }
        }

        return scheduleRemindMe(scheduleTimeBuilder, content, user, channel);
    } else {
        return Promise.resolve(false)
    }
}

async function scheduleOn(
    channel: TextBasedChannels,
    user: User,
    dateAndTimePart: string,
    content: string
) {
    const parsedDateTime = new Date(Date.parse(dateAndTimePart));
    if (parsedDateTime && !Number.isNaN(parsedDateTime)) {
        return await scheduleRemindMe(parsedDateTime, content, user, channel);
    } else {
        channel.send(
            "Ik kan je gegeven datum en tijd helaas niet verwerken. Probeer eens hetvolgende:\n" +
            "```\n" +
            `\$${COMMAND} aug 7 2021, 18:32; zet de container aan de weg \n` +
            "```"
        );
        return false;
    }
}

async function scheduleRemindMe(
    date: Date,
    content: string,
    user: User,
    channel: TextBasedChannels
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
        const response: InsertOneResult<Document> = await collection.insertOne(remindMeDocument)
        if (response.acknowledged) {
            return scheduleJobForRemindMe(
                randomString,
                date,
                channel,
                user,
                content
            );
        } else {
            channel.send(
                "Er is wat mis gegaan bij het opslaan van de remindme..."
            );
            return false
        }
    } else {
        return false
    }
}

function scheduleJobForRemindMe(
    id: string,
    date: Date,
    channel: TextBasedChannels,
    user: User,
    content: string
) {
    const job = scheduleJob(date, () =>
        channel.send(
            `<@${user}>, ik heb een herinnering voor je: **${content}**`
        )
    );
    activeRemindersMap.set(id, job);
    log.info(
        `Scheduled a reminder for user ${user.username} on ${date}: ${content}`
    );
    return true
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
                const userPromise = discordClient.users.fetch(reminder.discordId);
                const channelPromise = discordClient.channels.fetch(
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
                            content
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
