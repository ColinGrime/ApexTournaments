

// Holds data on the different servers that the bot is on.
class TournamentData {
    serverData = require('../../../assets/server-data.json');
    tournaments = {};

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
        if (this.#isTournamentCreated()) {
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