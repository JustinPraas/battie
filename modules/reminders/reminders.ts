import { User } from "discord.js";
import { FindCursor } from "mongodb";
import { Job } from "node-schedule";
import { battieDb } from "../../main";
import { Command } from "../../models/Command";
import { getFriendlyDate } from "../../utils";
import { reminderCommands, RemindMeDocument } from "./reminders-module";
import { activeRemindersMap } from "./remind_me";

const COMMAND = "reminders";

export const reminders: Command = {
    name: COMMAND,
    format: `${COMMAND} [remove <id>]`,
    description:
        "Toont jouw actieve reminders, of verwijdert de reminder met de aangegeven ID. Zie `$help reminders` voor meer info.",
    execute(message, args) {
        const user: User = message.author;
        const remove = args.shift() == "remove";

        if (battieDb) {
            const collection = battieDb.collection("reminders");
            if (remove) {
                const id = args.shift();
                if (!id) {
                    return message.channel.send(
                        "Je moet dan wel een ID meegeven van de reminder"
                    );
                }

                collection.deleteOne({ id: id }).then((response) => {
                    if (response.deletedCount > 0) {
                        const foundReminderJob: Job | undefined =
                            activeRemindersMap.get(id);
                        if (foundReminderJob != undefined) {
                            foundReminderJob.cancel();
                            message.channel.send("Je reminder is verwijdert");
                        } else {
                            message.channel.send(
                                "Er ging iets mis bij het verwijderen van de reminder"
                            );
                        }
                    } else {
                        message.channel.send(
                            "Je reminder kon niet verwijdert worden"
                        );
                    }
                });
            } else {
                const myReminders: FindCursor<RemindMeDocument> = collection
                    .find({ discordId: user.id, timestamp: {$gt: Date.now()} })
                    .map((value) => value as RemindMeDocument);

                myReminders.count().then((count) => {
                    if (count > 0) {
                        let myRemindersStringBuilder =
                            "Dit zijn jouw reminders:";
                        myRemindersStringBuilder += `\n**\`${"ID".padEnd(
                            8
                        )}${"Date and time".padEnd(28)}Content\`**`;
                        myReminders
                            .forEach((reminder) => {
                                const date = new Date(reminder.timestamp);
                                myRemindersStringBuilder += `\n\`${reminder.id.padEnd(
                                    8
                                )}${getFriendlyDate(date).padEnd(28)}${
                                    reminder.content
                                }\``;
                            })
                            .then(() => {
                                message.channel.send(myRemindersStringBuilder);
                            });
                    } else {
                        message.channel.send("Je hebt geen actieve reminders");
                    }
                });
            }
        }
    },
};
