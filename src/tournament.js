var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Tournament_instances, _Tournament_isTournamentCreated;
import serverData from '../resources/server-data.json';
serverData['hii'] = 'oh';
class Tournament {
    constructor() {
        _Tournament_instances.add(this);
        this.serverData = ('../../../assets/server-data.json');
        this.tournaments = {};
    }
    init(guildID, channelID, categoryID) {
        serverData[guildID] = {
            "channelID": channelID,
            "categoryID": categoryID
        };
    }
    create(guildID) {
        if (__classPrivateFieldGet(this, _Tournament_instances, "m", _Tournament_isTournamentCreated).call(this, null)) {
            return false;
        }
        this.tournaments[guildID] = {};
        return true;
    }
    list(guildID) {
        if (!__classPrivateFieldGet(this, _Tournament_instances, "m", _Tournament_isTournamentCreated)) {
            return null;
        }
        if ('players' in this.tournaments[guildID]) {
            return this.tournaments[guildID]['players'];
        }
        else {
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
_Tournament_instances = new WeakSet(), _Tournament_isTournamentCreated = function _Tournament_isTournamentCreated(guildID) {
    return guildID in this.tournaments;
};
