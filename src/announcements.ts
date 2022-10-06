import { TextChannel } from "discord.js";

/**
 * Creates a repeating announcement that will run every so often until the time runs out.
 * @param channel channel to send the announcement in
 * @param optionsCallback callback for options message to send
 * @param finishCallback callback to run once the announcement is complete
 * @param time time to keep sending message (in seconds)
 * @param period period that messages will be sent in (in seconds)
 */
export function createRepeatingAnnouncement(channel: TextChannel, optionsCallback: any, finishCallback: any, time: number, period: number) {
    channel.send(optionsCallback(time));
    time -= period;
    
    const interval = setInterval(() => {
        if (time <= 0) {
            clearInterval(interval);
            finishCallback();
            return;
        }

        channel.send(optionsCallback(time));
        time -= period;
    }, 1000 * period);
}