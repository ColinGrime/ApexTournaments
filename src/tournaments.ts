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
    create(): boolean {
        if (!this.isReady || this.isWaiting) {
            return false;
        }

        // Waits for 30 seconds for players to opt-in.
        this.isWaiting = true;
        this.timeToWait = getTime(30);

        createRepeatingAnnouncement(this.channel, (time: number) => {
            return { embeds: [createEmbed(
                    '**An apex tournament has just been created.**',
                    '**Join now or forever be blacklisted.**',
                    '',
                    ':regional_indicator_j::regional_indicator_o::regional_indicator_i::regional_indicator_n: :black_small_square: **/tournament opt-in**',
                    ':regional_indicator_q::regional_indicator_u::regional_indicator_i::regional_indicator_t: :black_small_square: **/tournament opt-out**',
                    ':regional_indicator_l::regional_indicator_i::regional_indicator_s::regional_indicator_t: :black_small_square: **/tournament list**',
                    ':regional_indicator_i::regional_indicator_n::regional_indicator_f::regional_indicator_o: :black_small_square: **/tournament current**'
                ).setFooter({ text: `${time} SECONDS LEFT` })] 
            }
        }, () => {
            if (this.isWaiting) {
                this.start();
            }
        }, 30, 10);

        return true;
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
    async optIn(discord: string) {
        if (!(discord in playerIDs) || !this.isWaiting) {
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
    start() {
        if (this.list().length < 2 || !this.isWaiting || this.hasStarted) {
            return false;
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
            embeds: [createEmbed('**The tournament has officially begun!**')]
        })

        return true;
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