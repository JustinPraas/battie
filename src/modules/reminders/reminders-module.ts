import { reminders } from "./reminders";
import { remindMe } from "./remind_me";

export interface RemindMeDocument {
    id: string;
    discordId: string;
    channelId: string;
    content: string;
    timestamp: number;
}

export const reminderCommands = [remindMe, reminders];
