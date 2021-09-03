import { disconnect, summon } from "./summon-disconnect";
import { nowPlaying } from "./now-playing";
import { pause } from "./pause";
import { play } from "./play";
import { queue } from "./queue";
import { resume } from "./resume";
import { skip } from "./skip";
import { MusicSubscription } from "../../models/MusicSubscription";
import { Snowflake } from "discord.js";

export interface Song {
    title: string;
    url: string;
    lengthSeconds: string;
    viewCount: string;
    startTimeSeconds: number;
}

export const musicCommands = [play, disconnect, summon, skip, pause, resume, nowPlaying, queue];

export const guildMusicSubscriptionMap = new Map<Snowflake, MusicSubscription>();


