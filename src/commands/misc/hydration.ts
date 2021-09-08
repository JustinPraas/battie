import { Client, User } from "discord.js";
import { Document } from "mongodb";
import { RecurrenceRule, scheduleJob } from "node-schedule";
import { log } from "../../process/main";
import { battieDb } from "../../process/mongodb";
import { Command } from "../../models/Command";

export const hydration: Command = {
    command:
    {
        name: 'hydration-reminder',
        description: 'Meld jou aan/af voor de hourly hydration reminder',
        options: [
            {
                choices: [
                    {
                        name: "4 hours",
                        value: 240,
                    },
                    {
                        name: "3 hours",
                        value: 180,
                    },
                    {
                        name: "2.5 hours",
                        value: 150,
                    },
                    {
                        name: "2 hours",
                        value: 120,
                    },
                    {
                        name: "1.5 hour",
                        value: 90,
                    },
                    {
                        name: "1 hour",
                        value: 60,
                    },
                    {
                        name: "45 minutes",
                        value: 45,
                    },
                    {
                        name: "30 minutes",
                        value: 30,
                    },
                    {
                        name: "Ik wil niet geremind worden",
                        value: 0,
                    }
                ],
                name: 'minutes',
                type: 'INTEGER' as const,
                description: 'Om de hoeveel minuten wil je geremind worden?',
                required: true,
            },
        ],
    },
    async execute(interaction, _1, user) {
        await interaction.deferReply()
        const minutes = interaction.options.getInteger("minutes")!
        const success = await updateSubscriber(user, minutes)

        if (success) {
            await interaction.followUp("Je reminder staat gescheduled voor de aangegeven tijdsinterval")
            return
        } else {
            await interaction.followUp("Er ging iets fout bij het subscriben op de hydration reminder.. probeer het later nog eens")
            return
        }
    },
};

const updateSubscriber = async (user: User, minutes: number): Promise<boolean> => {
    if (battieDb) {
        const collection = battieDb.collection("hydration")
        const ack = collection.updateOne({userId: user.id}, {$set: {userId: user.id, minutes: minutes}}, {upsert: true})
        const acknowledged = (await ack).acknowledged
        return acknowledged
    } else {
        return false
    }
}

export function startSchedulingHydrationReminders(client: Client) {
    const rule = new RecurrenceRule();
    rule.minute = [0, 15, 30, 45];
    scheduleJob(rule, () => remindHydrationSubscribers(client));
}

async function remindHydrationSubscribers(client: Client) {
    const currentHour = new Date(Date.now()).getUTCHours() + 2 
    const isMidnight = currentHour > 2 && currentHour < 7
    if (battieDb && !isMidnight) {
        const currentTime = new Date(Date.now())
        const currentMinuteOfDay = (currentTime.getUTCHours() + 2) * 60 + currentTime.getMinutes()


        // Get all subscribers for this timeslot
        const subs = await (await battieDb.collection("hydration").find().toArray()).filter(sub => currentMinuteOfDay % sub.minutes == 0)
        
        log.info(`Reminding ${subs.length} subscribers to hydrate`)
        subs.forEach((document: Document) => {
            const userId = document.userId;
            client.users.cache.get(userId)?.send("Reminder: vergeet niet te hydrateren 🥤")
        });
    }
}

