import fs from 'node:fs';
import { ChannelType, Guild, TextChannel, VoiceChannel } from 'discord.js';
import { client } from './index.js';
import { DiscordID, ApexID, playerIDs } from '../assets/config.js';
import { getWheel, getWheelData, hasValidTrackers } from './data-retriever.js';
import { getRankings, Participant, update } from './participant.js'
import { getTime, isEqual } from './utils/common-utils.js';
import { createChannel, moveUsersToChannel, renameChannel, sendToChannel } from './utils/discord-utils.js';
import { createRepeatingAnnouncement } from './announcements.js';
import { createEmbed } from './utils/discord-utils.js';
import messages from '../assets/messages.js';

interface GuildData {
    tournamentChannelID: string,
    tournamentVoiceChannelIDs: string[],
}

interface Timer {
    startTime: number,
    endTime?: number
}

interface Teams {
    team1: string[],
    team2: string[]
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
 * @param data guildData to be added (channelID, voiceIDs)
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
    voiceChannels: VoiceChannel[] = [];
    isReady: boolean = false
    isWaiting: boolean = false
    hasStarted: boolean = false
    tournamentTime: Timer
    participants: Participant[] = []
    participantsData: Participant[][] = [];

    constructor(guildID: string) {
        tournaments[guildID] = this;

        // Get Guild object.
        this.guild = client.guilds.cache.get(guildID);

        // If the guild has a tournament channel setup, it's already ready for tournaments.
        if (guildID in guildData) {
            const cache = this.guild.channels.cache;

            // Get the Tournament channel and Team voice channels.
            this.channel = cache.get(guildData[guildID].tournamentChannelID) as TextChannel;
            this.voiceChannels.push(cache.get(guildData[guildID].tournamentVoiceChannelIDs[0]) as VoiceChannel);
            this.voiceChannels.push(cache.get(guildData[guildID].tournamentVoiceChannelIDs[1]) as VoiceChannel);

            // Tournament is ready.
            this.isReady = true;
        }
    }

    /**
     * Initializes the channel and voice channels for tournaments.
     * @param channelID tournament channel ID
     */
    async init(channelID: string) {
        // Renames Tournament text channel.
        this.channel = await renameChannel(this.guild, channelID, 'Tournaments', 'News on all Apex Tournaments.') as TextChannel;
        
        // Creates new Team voice channels in the category.
        this.voiceChannels = [];
        this.voiceChannels.push(await createChannel(this.guild, 'Team 1', ChannelType.GuildVoice, this.channel.parentId) as VoiceChannel);
        this.voiceChannels.push(await createChannel(this.guild, 'Team 2', ChannelType.GuildVoice, this.channel.parentId) as VoiceChannel);

        addGuildData(this.guild.id, {
            "tournamentChannelID": channelID,
            "tournamentVoiceChannelIDs": [this.voiceChannels[0].id, this.voiceChannels[1].id],
        });

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
            return messages.createTournamentFailureAlreadyStarted;
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
                    sendToChannel(this.channel, message);
                }
            }
        }, 60, 15);

        return messages.createTournamentResponse;
    }

    /**
     * Retrieves each participant's DiscordID.
     * @returns list of tournament participants that are opted-in
     */
    list(): DiscordID[] {
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
     * @param username username of the player
     * @param discord discordID of the player
     * @returns a Promise returning the status message
     */
    async optIn(username: string, discord: string): Promise<object> {
        if (!(discord in playerIDs)) {
            return messages.failureNotEligible;
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
            "username": username,
            "discordID": discordID,
            "apexID": apexID,
            "gameData": {
                "games": 0,
                "wins": 0,
                "kills": 0,
                "damage": 0
            },
            "points": 0
        });

        sendToChannel(this.channel, `**<@${discordID}> has opted into the tournament!**`);
        return null;
    }

    /**
     * @param discord discordID of the player
     * @returns true if the player was successfully opted-out
     */
    optOut(discord: string): object {
        if (!(discord in playerIDs)) {
            return messages.failureNotEligible;
        } else if (!this.isWaiting && !this.hasStarted) {
            return messages.leaveTournamentFailureNotAvailable;
        } else if (this.hasStarted) {
            return messages.leaveTournamentFailureAlreadyStarted;
        }

        const discordID: DiscordID = discord as DiscordID;

        // Check if the user is not currently opted in to the tournament.
        const list = this.list();
        if (list === null || !list.includes(discordID)) {
            return messages.leaveTournamentFailureNotJoined;
        }

        // Find participant to remove.
        let participantToRemove = null;
        for (const participant of this.participants) {
            if (participant.discordID === discordID) {
                participantToRemove = participant;
            }
        }

        // Remove participant.
        if (participantToRemove !== null) {
            this.participants.splice(this.participants.indexOf(participantToRemove), 1);
        }

        sendToChannel(this.channel, `**<@${discordID}> has opted out of the tournament!**`);
        return null;
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
        sendToChannel(this.channel, messages.startTournamentSuccess);

        // Start tournament update checker.
        const interval = setInterval(() => {
            if (!this.hasStarted) {
                clearInterval(interval);
                return;
            }

            this.update();
        }, 30 * 1000);

        return null;
    }

    /**
     * Stops the tournament, updates and saves rankings, and deletes the tournament.
     */
    async stop() {
        if (!this.hasStarted) {
            return;
        }

        // Get end time and update rankings.
        this.tournamentTime.endTime = getTime();
        await this.update('**Final Rankings:**', true);

        const tournamentData = {
            "guildID": this.guild.id,
            "startTime": this.tournamentTime.startTime,
            "endTime": this.tournamentTime.endTime,
            "data": this.participantsData
        }

        // Make tournaments folder if one does not exist.
        if (!fs.existsSync('tournaments')) {
            fs.mkdirSync('tournaments');
        }

        // Save all tournament data.
        fs.writeFile(`tournaments/${new Date()}.json`, JSON.stringify(tournamentData, null, 2), 'utf-8', (err) => {
            if (err) {
                throw err;
            } else {
                // Delete tournament.
                delete tournaments[this.guild.id];
            }
        });
    }

    /**
     * Updates the current rankings.
     */
    async current() {
        if (!this.hasStarted) {
            return;
        }

        await update(this.participants, this.tournamentTime.startTime);
    }

    /**
     * Updates the tournament and checks to see if any game data has been changed.
     * If new data is found, it will announce the new rankings.
     * 
     * @param title title of the embed
     * @param forceSend whether embed should be sent regardless if it's new data
     */
    async update(title: string = "**New Rankings Found:**", forceSend: boolean = false) {
        if (!this.hasStarted) {
            return;
        }

        // Get old rankings, update all participants, then get new rankings.
        const oldRankings: string[] = getRankings(this.participants);
        await update(this.participants, this.tournamentTime.startTime);
        const newRankings: string[] = getRankings(this.participants);

        // Announce new rankings if they have changed.
        if (forceSend || !isEqual(oldRankings, newRankings)) {
            sendToChannel(this.channel, title, ...newRankings);

            // Save data if it's new.
            if (!isEqual(oldRankings, newRankings)) {
                this.participantsData.push([...this.participants]);
            }
        }
    }

    /**
     * Attempts to split the participants up into 2 teams.
     * @returns status message
     */
    split() {
        if (this.participants.length === 0) {
            return messages.splitParticipantsFailureNotAvailable;
        }

        const participantIDs: string[] = [...this.participants].map(p => p.discordID);

        // Check each voice channel for all participants.
        for (const voiceChannel of this.voiceChannels) {
            for (const member of voiceChannel.members.values()) {
                if (participantIDs.includes(member.user.id)) {
                    participantIDs.splice(participantIDs.indexOf(member.user.id), 1);
                }
            }
        }

        // Check if some of the participants aren't in a Team Voice Channel.
        if (participantIDs.length !== 0) {
            return messages.splitParticipantsFailureNotEnoughPlayers;
        }

        // Get all usernames and their corresponding IDs.
        const users: object = {};
        for (const participant of this.participants) {
            users[participant.username] = participant.discordID;
        }

        const usernames = Object.keys(users);
        const tournament = this;

        // Starting the splitting wheel.
        getWheel(usernames).then(data => {
            const link = data.request.res.responseUrl;

            // Send wheel announcement.
            sendToChannel(this.channel, '__Commencing the splitting wheel__', `**${link}**`);

            // Check for wheel completion.
            let timesToCheck = 3;

            // Check for wheel data every 5 seconds after predicted completion is over.
            setTimeout(() => {
                const interval = setInterval(async () => {
                    if (timesToCheck-- === 0) {
                        sendToChannel(this.channel, '**Error**: Splitting stopped. Wheel took too long to pick.');
                        clearInterval(interval);
                        return;
                    }

                    const wheelData = await getWheelData(link);
                    if (wheelData !== null) {
                        processWheelData(wheelData);
                        clearInterval(interval);
                    }
                }, 5 * 1000);
            }, (usernames.length * 10 * 1000) + 5)
        })

        /**
         * Process the wheel data.
         * @param wheelData team data from the wheel
         */
        function processWheelData(wheelData: object) {
            const teams: Teams = {
                team1: [],
                team2: []
            };

            const teamsFormatted: Teams = {
                team1: [],
                team2: []
            }

            // Find teams for each user.
            for (const user in users) {
                checkTeam(teams, user, wheelData, 'team1');
                checkTeam(teams, user, wheelData, 'team2');
            }

            // Format the teams.
            for (const team in teams) {
                for (const user of teams[team]) {
                    teamsFormatted[team].push(`<@${user}>`);
                }
            }

            moveUsersToChannel(tournament.voiceChannels[0], ...teams.team1);
            moveUsersToChannel(tournament.voiceChannels[1], ...teams.team2);
            sendToChannel(tournament.channel, '__Teams have been decided:__', `**Team #1**: ${teamsFormatted.team1}`, `**Team #2**: ${teamsFormatted.team2}`)
        }

        /**
         * Checks if a user is on a team.
         * @param teams list of teams
         * @param user user to check
         * @param wheelData wheel data
         * @param team team to check against
         */
        function checkTeam(teams: Teams, user: string, wheelData: object, team: string) {
            for (const username of wheelData[team]) {
                if (user === username) {
                    teams[team].push(users[user]);
                }
            }
        }

        return messages.splitParticipantsResponse;
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