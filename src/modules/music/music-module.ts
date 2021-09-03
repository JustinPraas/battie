import { Message, StreamDispatcher, TextChannel, VoiceChannel, VoiceConnection } from "discord.js";
import { disconnect, summon } from "./summon-disconnect";
import { nowPlaying } from "./now-playing";
import { pause } from "./pause";
import { play } from "./play";
import { queue } from "./queue";
import { resume } from "./resume";
import { skip } from "./skip";

export interface QueueConstruct {
    textChannel: TextChannel | null,
    voiceChannel: VoiceChannel | null,
    connection: VoiceConnection | null,
    dispatcher: StreamDispatcher | null,
    songs: Song[],
    volume: number,
    playing: boolean,
}

export const getEmptyQueueConstruct = () => ({
    voiceChannel: null,
    connection: null,
    textChannel: null,
    playing: false,
    dispatcher: null,
    songs: [],
    volume: 5,
});

export interface Song {
    title: string;
    url: string;
    lengthSeconds: string;
    viewCount: string;
    startTimeSeconds: number;
}

export const musicCommands = [play, disconnect, summon, skip, pause, resume, nowPlaying, queue];

export const guildMusicQueueMap = new Map<string, QueueConstruct>();


