import fs from 'node:fs';
import { GameData, ApexID, Participant } from './participant.js'

interface ServerData {
    tournamentChannelID: string,
    tournamentCategoryID: string
}

interface Tournament {
    startTime: number,
    endTime: number,
    participants: Participant[],
}

let apexData: ServerData[] = [];
// let tournaments: 
let isActive: boolean = false;

// Check if server data file exists already, if so get the data.
if (fs.existsSync('apex-data.json')) {
    fs.readFile('apex-data.json', 'utf-8', (err, data) => {
        if (err) {
            throw err;
        } else {
            apexData = JSON.parse(data);
            isActive = true;
        }
    });
} else {
    isActive = true;
}

/**
 * @param serverData server data to add
 */
function addServerData(serverData: ServerData) {
    if (!isActive) {
        return;
    }

    apexData.push(serverData);
    fs.writeFile('apex-data.json', JSON.stringify(apexData), 'utf-8', (err) => {
        if (err) {
            throw err;
        }
    });
}

class Tournament {
    init(guildID, channelID, categoryID) {
        serverData[guildID] = {
            "channelID": channelID,
            "categoryID": categoryID
        };
    }

    #isTournamentCreated(guildID) {
        return guildID in this.tournaments;
    }

    create(guildID) {
        if (this.#isTournamentCreated(null)) {
            return false;
        }

        this.tournaments[guildID] = {};
        return true;
    }

    list(guildID) {
        if (!this.#isTournamentCreated) {
            return null;
        }

        if ('players' in this.tournaments[guildID]) {
            return this.tournaments[guildID]['players'];
        } else {
            return [];
        }
    }

    optIn(guildID, username) {
        const list = this.list(guildID);
        if (list === null || username in list) {
            return false;
        }

        // Check for damage/kill trackers, if no then fail.
        list.push(username);
        this.tournaments[guildID]['players'] = list;
        return true;
    }

    optOut(guildID, username) {
        const list = this.list(guildID);
        if (list === null || !(username in list)) {
            return false;
        }

        list.splice(list.indexOf(username), 1);
        return true;
    }

    start(guildID) {
        if (this.list(guildID).length < 3) {
            return false;
        }

        // Start tracking, get initial kills/damage.
    }

    stop(guildID) {
        // Sends the top kills, damage, and top overall!
    }
}