import { Client, Message, User } from "discord.js";
import { Db, Document, FindCursor } from "mongodb";
import { RecurrenceRule, scheduleJob } from "node-schedule";
import { log } from "../../main/main";
import { battieDb } from "../../main/mongodb";
import { Command } from "../../models/Command";
import { reactWithDefaultEmoji } from "../../util/utils";

interface HydrationSubscriberDocument {
    discordId: string;
}

const COMMAND = "hydration";

export const hydration: Command = {
    name: COMMAND,
    format: `\`${COMMAND} [un]subscribe`,
    description: "Meld jou aan/af voor de hourly hydration reminder",
    execute(message, args) {
        const subParam = args.shift();
        const user: User = message.author;

        if (subParam == "subscribe") {
            addSubscriber(user, message);
        } else if (subParam == "unsubscribe") {
            removeSubscriber(user, message);
        } else {
            message.channel.send("Wat wil je dat ik doe?");
        }
    },
};

function removeSubscriber(user: User, message: Message) {
    if (battieDb) {
        isUserSubscribed(user, battieDb).then((value) => {
            if (value == null) {
                return message.channel.send(
                    "Je was niet eens gesubscribed op de hydration reminder!"
                );
            } else {
                const collection = battieDb!.collection("hydration");
                const newSub: HydrationSubscriberDocument = {
                    discordId: user.id,
                };

                collection
                    .deleteOne(newSub)
                    .then(() => {
                        reactWithDefaultEmoji(message, "👍🏼");
                    })
                    .catch((err) => {
                        message.channel.send(
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

function addSubscriber(user: User, message: Message) {
    if (battieDb) {
        isUserSubscribed(user, battieDb).then((value) => {
            if (value != null) {
                return message.channel.send(
                    "Je bent al gesubscribed op de hydration reminder!"
                );
            } else {
                const collection = battieDb!.collection("hydration");
                const newSub: HydrationSubscriberDocument = {
                    discordId: user.id,
                };

                collection
                    .insertOne(newSub)
                    .then(() => {
                        reactWithDefaultEmoji(message, "👍🏼");
                    })
                    .catch((err) => {
                        message.channel.send(
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
