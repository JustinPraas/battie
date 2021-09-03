import { User } from "discord.js";
import { FindCursor } from "mongodb";
import { Job } from "node-schedule";
import { battieDb } from "../../main/mongodb";
import { Command } from "../../models/Command";
import { getFriendlyDate } from "../../util/utils";
import { RemindMeDocument } from "./reminders-module";
import { activeRemindersMap } from "./remind_me";

export const reminders: Command = {
    command:
    {
        name: 'reminders',
        description: 'Toont jouw actieve reminders, of verwijdert de reminder met de aangegeven ID',
        options: [
            {
                name: 'remove',
                type: 'STRING' as const,
                description: 'Optionele parameter om een reminder te verwijderen',
                required: false,
            },
        ],
    },
    async execute(interaction) {
        const user: User = interaction.member!.user as User;

        const removeId = interaction.options.get('remove')

        if (battieDb) {
            const collection = battieDb.collection("reminders");
            if (removeId && removeId.value) {
                collection.deleteOne({ id: removeId.value }).then(async (response) => {
                    if (response.deletedCount > 0) {
                        const foundReminderJob: Job | undefined =
                            activeRemindersMap.get(removeId.value!.toString());
                        if (foundReminderJob != undefined) {
                            foundReminderJob.cancel();
                            await interaction.reply("Je reminder is verwijdert");
                            return
                        } else {
                            await interaction.reply(
                                "Er ging iets mis bij het verwijderen van de reminder"
                            );
                            return
                        }
                    } else {
                        await interaction.reply(
                            "Je reminder kon niet verwijdert worden"
                        );
                        return
                    }
                });
            } else {
                const myReminders: FindCursor<RemindMeDocument> = collection
                    .find({ discordId: user.id, timestamp: { $gt: Date.now() } })
                    .map((value) => value as RemindMeDocument);

                myReminders.count().then(async (count) => {
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
                                )}${getFriendlyDate(date).padEnd(28)}${reminder.content
                                    }\``;
                            })
                            .then(async () => {
                                await interaction.reply(myRemindersStringBuilder);
                                return
                            });
                    } else {
                        await interaction.reply("Je hebt geen actieve reminders");
                        return
                    }
                });
            }
        }
    },
};
