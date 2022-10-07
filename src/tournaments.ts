import fs from 'node:fs';
import { ChannelType, Guild, TextChannel } from 'discord.js';
import { client } from './index.js';
import { DiscordID, ApexID, playerIDs } from '../assets/config.js';
import { hasValidTrackers } from './stats.js';
import { getRankings, Participant, update } from './participant.js'
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
    channel: TextChannel
    isReady: boolean = false
    isWaiting: boolean = false
    hasStarted: boolean = false
    tournamentTime: Timer
    participants: Participant[] = []

    constructor(guildID: string) {
        tournaments[guildID] = this;

        // Get Guild object.
        this.guild = client.guilds.cache.get(this.guild.id);

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
        addGuildData(this.guild.id, {
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
     * Creates a new tournament and schedules the announcements.
     * @returns status message
     */
    create(): object {
        if (!this.isReady) {
            return messages.createTournamentFailureNotInitialized;
        } else if (this.isWaiting) {
            return messages.createTournamentFailureAlreadyOngoing;
        }

        // Wait for tournament to start.
        this.isWaiting = true;

        createRepeatingAnnouncement(this.channel, (time: number) => {
            // If tournament has already started, signal for announcements to stop.
            if (this.hasStarted) {
                return null;
            }

            // Return announcement embed.
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
        }, 60, 15);

        return messages.createTournamentResponse;
    }

    /**
     * Retrieves each participant's DiscordID.
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
     * Attempts to opt-in a user.
     * Will fail if the user has invalid trackers or if something is wrong with the tournament.
     * 
     * @param discord discordID of the player
     * @returns a Promise returning the status message
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
     * Starts a tournament and sets the start time for tracking.
     * @returns status message
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
     * Stops the tournament, updates and saves rankings, and deletes the tournament.
     * @returns 
     */
    async stop() {
        if (!this.hasStarted) {
            return;
        } else {
            this.hasStarted = false;
        }

        await update(this.participants, this.tournamentTime.startTime);
    }

    /**
     * Updates the tournament and checks to see if any game data has been changed.
     * @returns a Promise containing whether or the not game data has changed
     */
    async update(): Promise<boolean> {
        if (!this.hasStarted) {
            return false;
        }

        // Get old rankings then update all participants looking for new game data.
        const oldRankings = getRankings(this.participants);
        await update(this.participants, this.tournamentTime.startTime);

        // Check to see if the rankings have changed.
        return oldRankings !== getRankings(this.participants);
    }
}

/**
 * Gets the tournament of the specified guild.
 * If none are found, a new tournament instance is created.
 * 
 * @param guildID guildID to check
 * @returns tournament of the specified guild
 */
export function getTournament(guildID: string) {
    if (guildID in tournaments) {
        return tournaments[guildID];
    }

    const tournament: Tournament = new Tournament(guildID);
    tournaments[guildID] = tournament;
    return tournament;
}