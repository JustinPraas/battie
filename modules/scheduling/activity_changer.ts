import { ActivityOptions, Client } from "discord.js";
import { RecurrenceRule, scheduleJob } from "node-schedule"
import { log } from "../../main";

interface Activity {
    activity: string;
    options?: ActivityOptions;
}

const activities: Activity[] = [
    {
        activity: "$help voor commands",
    },
    {
        activity: "Revi dc",
        options: { type: "WATCHING" },
    },
    {
        activity: "Justin plank @zmi",
        options: { type: "WATCHING" },
    },
    {
        activity: "Thijs build a track",
        options: { type: "WATCHING" },
    },
    {
        activity: "with my pp",
        options: { type: "PLAYING" },
    },
    {
        activity: "KPOP",
        options: { type: "LISTENING" },
    },
    {
        activity: "Redo of Healer",
        options: { type: "WATCHING" },
    },
    {
        activity: "Ramon loop killers",
        options: { type: "WATCHING" },
    },
    {
        activity: "Joost \"working\"",
        options: { type: "WATCHING" },
    },
    {
        activity: "Ruurd's jams",
        options: { type: "LISTENING" },
    },
    {
        activity: "Dennus' latest video",
        options: { type: "WATCHING" },
    },
    {
        activity: "Joost spoon pets",
        options: { type: "WATCHING" },
    },
    {
        activity: "Mert bike",
        options: { type: "WATCHING" },
    },
    {
        activity: "Daniel not play RS",
        options: { type: "WATCHING" },
    },
    {
        activity: "Bennie roll a cig",
        options: { type: "WATCHING" },
    },
]

export let currentActivity: Activity = activities[0];
export const randomActivity = () => {
    let foundNewActivity = false
    do {
        let newRandomActivity = activities[Math.floor(Math.random() * activities.length)];
        if (newRandomActivity != currentActivity) {
            currentActivity = newRandomActivity;
            foundNewActivity = true;
            return newRandomActivity;
        }
    } while (foundNewActivity)
    
    return activities[0];
}

export function startSchedulingNewActivites(client: Client) {
    const rule = new RecurrenceRule();
    rule.hour = [0, 4, 8, 12, 16, 20]
    scheduleJob(rule, function () {
        const newRandomActivity = randomActivity();
        client.user?.setActivity(newRandomActivity.activity, newRandomActivity?.options);
        log.info("Setting new activity:", newRandomActivity.activity)
    });
}