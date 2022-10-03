import fs from 'node:fs';
import { DiscordID, ApexID, playerIDs } from '../assets/config.js';
import { hasValidTrackers } from './stats.js';
import { Participant, update } from './participant.js'
import { getTime } from './utils/Utility.js';

interface GuildData {
    tournamentChannelID: string,
    tournamentCategoryID: string
}

interface Timer {
    startTime: number,
    endTime?: number
}

// Initialize server data and tournaments.
let guildData: object = {};
let tournaments: object = {};

// Check if server data file exists already, if so get the data.
if (fs.existsSync('apex-data.json')) {
    fs.readFile('apex-data.json', 'utf-8', (err, data) => {
        if (err) {
            throw err;
        } else {
            guildData = JSON.parse(data);
        }
    });
}

/**
 * @param guildID guildID to be added
 * @param data guildData to be added (channelID, categoryID)
 */
function addGuildData(guildID: string, data: GuildData) {
    guildData[guildID] = guildData;
    fs.writeFile('apex-data.json', JSON.stringify(guildData), 'utf-8', (err) => {
        if (err) {
            throw err;
        }
    });
}

class Tournament {
    guildID: string
    isReady: boolean = false
    timeToWait: number
    tournamentTime: Timer
    participants: Participant[] = []

    constructor(guildID: string) {
        this.guildID = guildID;
        tournaments[guildID] = this;

        // If the guild has a tournament channel/category setup, it's already ready for tournaments.
        if (guildID in guildData) {
            this.isReady = true;
        }
    }

    /**
     * Initializes the channel and category for tournaments.
     * @param channelID tournament channel ID
     * @param categoryID tournament category ID
     */
    init(channelID: string, categoryID: string) {
        addGuildData(this.guildID, {
            "tournamentChannelID": channelID,
            "tournamentCategoryID": categoryID
        });

        this.isReady = true;
    }

    /**
     * @returns true if a tournament was successfully created
     */
    create(): boolean {
        if (!this.isReady) {
            return false;
        }

        // Waits for 30 seconds for players to opt-in.
        this.timeToWait = getTime(30);
        return true;
    }

    /**
     * @returns list of tournament participants that are opted-in
     */
    list() {
        if (!this.isReady) {
            return null;
        }

        const list: DiscordID[] = [];
        for (const participant of this.participants) {
            list.push(participant.discordID);
        }

        return list;
    }

    /**
     * @param discord discordID of the player
     * @returns a promise that returns true if the player was successfully opted-in
     */
    async optIn(discord: string) {
        if (!(discord in playerIDs)) {
            return false;
        }

        const discordID: DiscordID = discord as DiscordID;
        const apexID: ApexID = playerIDs[discord] as ApexID;

        // Check if the user is already opted in to the tournament.
        const list = this.list();
        if (list === null || list.includes(discordID)) {
            return false;
        }

        // Check if the user has invalid trackers enabled.
        if (!(await hasValidTrackers(apexID))) {
            return false;
        }

        this.participants.push({
            "discordID": discordID,
            "apexID": apexID
        });
        return true;
    }

    /**
     * @param discord discordID of the player
     * @returns true if the player was successfully opted-out
     */
    optOut(discord: string) {
        if (!(discord in playerIDs)) {
            return false;
        }

        const discordID: DiscordID = discord as DiscordID;

        // Check if the user is not currently opted in to the tournament.
        const list = this.list();
        if (list === null || !list.includes(discordID)) {
            return false;
        }

        list.splice(list.indexOf(discordID), 1);
        return true;
    }

    /**
     * Starts a tournament.
     * @returns true if the tournament had enough players to start
     */
    start() {
        if (this.list().length < 3) {
            return false;
        }

        // Start tracking.
        this.tournamentTime = {
            startTime: getTime()
        };

        this.isReady = false;
        return true;
    }

    /**
     * Stops the tournament and sends tournament info.
     */
    stop() {
        update(this.participants, this.tournamentTime.startTime);

        for (const participant of this.participants) {
            console.log(`DiscordID${participant.discordID} and`);
            console.log(participant.gameData);
            console.log('');
        }
    }
}