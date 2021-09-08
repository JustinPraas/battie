import { Message, User } from "discord.js";
import { mods } from "../process/discord";

export function shuffle(array: any[]) {
    var currentIndex = array.length,
        randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }

    return array;
}

export function reactWithDefaultEmoji(message: Message, emoji: string) {
    message.react(emoji)
}

export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getFriendlyDate(d: Date) {
    var minutes =
            d.getMinutes().toString().length == 1
                ? "0" + d.getMinutes()
                : d.getMinutes(),
        hours =
            d.getHours().toString().length == 1
                ? "0" + d.getHours()
                : d.getHours(),
        ampm = d.getHours() >= 12 ? "pm" : "am",
        months = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ],
        days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return (
        days[d.getDay()] +
        " " +
        months[d.getMonth()] +
        " " +
        d.getDate() +
        " " +
        d.getFullYear() +
        " " +
        hours +
        ":" +
        minutes +
        ampm
    );
}

export function getHoursFromSeconds(seconds: number) {
    return Math.floor(seconds / 3600);
}

export function getMinutesFromSeconds(seconds: number) {
    return Math.floor((seconds % 3600) / 60);
}

export function getSecondsFromSeconds(seconds: number) {
    return Math.floor(seconds % 60);
}

export const isModerator = (user: User): boolean => {
    return mods.includes(user.id)
}
