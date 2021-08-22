import { ActivityOptions, Client } from "discord.js";
import { RecurrenceRule, scheduleJob } from "node-schedule"


interface Activity {
    activity: string;
    options?: ActivityOptions;
}

const activities: Activity[] = [
    {
        activity: "Typ $help om alle commands te zien",
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
        console.log("Setting new activity", newRandomActivity);
    });
}