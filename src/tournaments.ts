import fs from 'node:fs';
import { ChannelType, Guild, TextChannel } from 'discord.js';
import { client } from './index.js';
import { DiscordID, ApexID, playerIDs } from '../assets/config.js';
import { hasValidTrackers } from './stats.js';
import { Participant, update } from './participant.js'
import { getTime } from './utils/common-utils.js';
import { createChannel, renameChannel } from './utils/discord-utils.js';
import { createRepeatingAnnouncement } from './announcements.js';
import { createEmbed } from './utils/discord-utils.js';
import messages from '../assets/messages.js';

interface GuildData {
    tournamentChannelID: string,
    tournamentCategoryID: string
}

interface Timer {
    startTime: number,
    endTime?: number
}

// Initialize server data and tournaments.
export let guildData: object = {};
const tournaments: object = {};

// Check if server data file exists already, if so get the data.
if (fs.existsSync('guild-data.json')) {
    fs.readFile('guild-data.json', 'utf-8', (err, data) => {
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
    guildData[guildID] = data;
    fs.writeFile('guild-data.json', JSON.stringify(guildData, null, 2), 'utf-8', (err) => {
        if (err) {
            throw err;
        }
    });
}

export class Tournament {
    guild: Guild
    guildID: string
    channel: TextChannel
    isReady: boolean = false
    isWaiting: boolean = false
    hasStarted: boolean = false
    timeToWait: number = 0
    tournamentTime: Timer
    participants: Participant[] = []

    constructor(guildID: string) {
        this.guildID = guildID;
        tournaments[guildID] = this;

        // Get Guild object.
        this.guild = client.guilds.cache.get(this.guildID);

        // If the guild has a tournament channel/category setup, it's already ready for tournaments.
        if (guildID in guildData) {
            this.channel = this.guild.channels.cache.get(guildData[guildID].tournamentChannelID) as TextChannel;
            this.isReady = true;
        }
    }

    /**
     * Initializes the channel and category for tournaments.
     * @param channelID tournament channel ID
     * @param categoryID tournament category ID
     */
    async init(channelID: string, categoryID: string) {
        addGuildData(this.guildID, {
            "tournamentChannelID": channelID,
            "tournamentCategoryID": categoryID
        });

        // Creates Team channels in the category.
        this.channel = await renameChannel(this.guild, channelID, 'Tournaments', 'News on all Apex Tournaments.') as TextChannel;
        createChannel(this.guild, 'Team 1', ChannelType.GuildVoice, categoryID);
        createChannel(this.guild, 'Team 2', ChannelType.GuildVoice, categoryID);

        this.isReady = true;
    }

    /**
     * @returns true if a tournament was successfully created
     */
    create(): object {
        if (!this.isReady) {
            return messages.createTournamentFailureNotInitialized;
        } else if (this.isWaiting) {
            return messages.createTournamentFailureAlreadyOngoing;
        }

        // Waits for 30 seconds for players to opt-in.
        this.isWaiting = true;
        this.timeToWait = getTime(30);

        createRepeatingAnnouncement(this.channel, (time: number) => {
            return { 
                embeds: [createEmbed(...messages.createTournamentSuccess).setFooter({ text: `${time} SECONDS LEFT` })] 
            }
        }, () => {
            if (this.isWaiting) {
                const message = this.start();

                // Send any error messages.
                if (message !== null) {
                    this.channel.send({
                        embeds: [createEmbed(message)]
                    }).catch(err => {
                        console.log(err);
                    });
                }
            }
        }, 30, 10);

        return messages.createTournamentResponse;
    }

    /**
     * @returns list of tournament participants that are opted-in
     */
    list() {
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
    async optIn(discord: string): Promise<object> {
        if (!(discord in playerIDs)) {
            return messages.joinTournamentFailureNotEligible;
        } else if (!this.isWaiting) {
            return messages.joinTournamentFailureNotAvailable;
        }

        const discordID: DiscordID = discord as DiscordID;
        const apexID: ApexID = playerIDs[discord] as ApexID;

        // Check if the user is already opted in to the tournament.
        const list = this.list();
        if (list === null || list.includes(discordID)) {
            return messages.joinTournamentFailureAlreadyJoined;
        }

        // Check if the user has invalid trackers enabled.
        if (!(await hasValidTrackers(apexID))) {
            return messages.joinTournamentFailureInvalidTrackers;
        }

        this.participants.push({
            "discordID": discordID,
            "apexID": apexID
        });

        this.channel.send({
            embeds: [createEmbed(`**<@${discordID}> has opted into the tournament!**`)] 
        }).catch(err => {
            console.log(err);
        });

        return null;
    }

    /**
     * @param discord discordID of the player
     * @returns true if the player was successfully opted-out
     */
    optOut(discord: string) {
        if (!(discord in playerIDs) || !this.isWaiting) {
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
    start(): string {
        if (this.list().length < 2) {
            return messages.startTournamentFailureNotEnoughPlayers;
        } else if (!this.isWaiting) {
            return messages.startTournamentFailureNotAvailable;
        } else if (this.hasStarted) {
            return messages.startTournamentFailureAlreadyStarted;
        } else {
            this.isWaiting = false;
            this.hasStarted = true;
        }

        // Start tracking.
        this.tournamentTime = {
            startTime: getTime()
        };

        // Send start message.
        this.channel.send({
            embeds: [createEmbed(messages.startTournamentSuccess)]
        }).catch(err => {
            console.log(err);
        });

        return null;
    }

    /**
     * Stops the tournament and sends tournament info.
     */
    async stop() {
        if (!this.hasStarted) {
            return;
        } else {
            this.hasStarted = false;
        }

        await update(this.participants, this.tournamentTime.startTime);
    }
}

export function getTournament(guildID: string) {
    if (guildID in tournaments) {
        return tournaments[guildID];
    }

    const tournament: Tournament = new Tournament(guildID);
    tournaments[guildID] = tournament;
    return tournament;
}