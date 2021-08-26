import { StreamDispatcher, TextChannel, VoiceChannel, VoiceConnection } from "discord.js";
import { disconnect } from "./disconnect";
import { nowPlaying } from "./now-playing";
import { pause } from "./pause";
import { play } from "./play";
import { queue } from "./queue";
import { resume } from "./resume";
import { skip } from "./skip";

export interface QueueContruct {
    textChannel: TextChannel,
    voiceChannel: VoiceChannel,
    connection: VoiceConnection | null,
    dispatcher: StreamDispatcher | null,
    songs: Song[],
    volume: number,
    playing: boolean,
}

export interface Song {
    title: string;
    url: string;
    lengthSeconds: string;
    viewCount: string;
    startTimeSeconds: number;
}

export const musicCommands = [play, disconnect, skip, pause, resume, nowPlaying, queue];

export const guildMusicQueueMap = new Map<string, QueueContruct>();


