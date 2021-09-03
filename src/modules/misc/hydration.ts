import { Client, CommandInteraction, User } from "discord.js";
import { Db, Document, FindCursor } from "mongodb";
import { RecurrenceRule, scheduleJob } from "node-schedule";
import { log } from "../../main/main";
import { battieDb } from "../../main/mongodb";
import { Command } from "../../models/Command";

interface HydrationSubscriberDocument {
    discordId: string;
}

export const hydration: Command = {
    command:
    {
        name: 'hydration-reminder',
        description: 'Meld jou aan/af voor de hourly hydration reminder',
        options: [
            {
                choices: [
                    {
                        name: "on",
                        value: "on",
                    },
                    {
                        name: "off",
                        value: "off",
                    }
                ],
                name: 'toggle',
                type: 'STRING' as const,
                description: 'Wil je je aan of afmelden voor de reminder?',
                required: true,
            },
        ],
    },
    async execute(interaction) {

        const toggle = interaction.options.get('toggle')!.value! as string;
        const user: User = interaction.member!.user as User;

        if (toggle == "on") {
            await addSubscriber(user, interaction);
        } else if (toggle == "off") {
            await removeSubscriber(user, interaction);
        } else {
            await interaction.reply("Wat wil je dat ik doe?");
        }
    },
};

function removeSubscriber(user: User, interaction: CommandInteraction) {
    if (battieDb) {
        isUserSubscribed(user, battieDb).then(async (value) => {
            if (value == null) {
                await interaction.reply(
                    "Je was niet eens gesubscribed op de hydration reminder!"
                );
                return;
            } else {
                const collection = battieDb!.collection("hydration");
                const newSub: HydrationSubscriberDocument = {
                    discordId: user.id,
                };

                collection
                    .deleteOne(newSub)
                    .then(async () => {
                        await interaction.reply(
                            "Je bent nu niet meer gesubscribed op de hydration reminder!"
                        );
                    })
                    .catch(async (err) => {
                        await interaction.reply(
                            "Er ging iets fout tijdens het unsubscriben op de hydration reminder... sorry"
                        );
                        log.error(
                            "Something went wrong while unsubscribing to the hydration reminder:",
                            err
                        );
                    });
            }
        });
    }
}

function addSubscriber(user: User, interaction: CommandInteraction) {
    if (battieDb) {
        isUserSubscribed(user, battieDb).then(async (value) => {
            if (value != null) {
                await interaction.reply(
                    "Je bent al gesubscribed op de hydration reminder!"
                );
            } else {
                const collection = battieDb!.collection("hydration");
                const newSub: HydrationSubscriberDocument = {
                    discordId: user.id,
                };

                collection
                    .insertOne(newSub)
                    .then(async () => {
                        await interaction.reply(
                            "Je bent nu gesubscribed op de hydration reminder!"
                        );
                    })
                    .catch(async (err) => {
                        await interaction.reply(
                            "Er ging iets fout tijdens het subscriben op de hydration reminder... sorry"
                        );
                        log.error(
                            "Something went wrong while subscribing to the hydration reminder:",
                            err
                        );
                    });
            }
        });
    }
}

const isUserSubscribed = (
    user: User,
    battieDb: Db
): Promise<Document | null> => {
    const collection = battieDb.collection("hydration");
    if (collection) {
        return collection.findOne({ discordId: user.id });
    }
    return Promise.resolve(null);
};

export function startSchedulingHydrationReminders(client: Client) {
    const rule = new RecurrenceRule();
    rule.minute = 0;
    scheduleJob(rule, () => remindHydrationSubscribers(client));
}

function remindHydrationSubscribers(client: Client) {
    if (battieDb) {
        const subs: FindCursor<Document> = battieDb.collection("hydration").find();
        log.info(`Reminding all subscribers to hydrate`);
        subs.forEach((sub: Document) => {
            const discordId = sub.discordId;
            client.users.cache.get(discordId)?.send("Hydration Reminder: drink ongeveer 200-300ml water!")
        });
    }
}
