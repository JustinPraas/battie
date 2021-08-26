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
