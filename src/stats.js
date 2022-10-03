var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import 'dotenv/config';
import axios from 'axios';
// Apex API requests that can be made.
const statisticsQueryByUID = `https://api.mozambiquehe.re/bridge?auth=${process.env.APEX_API}&uid=PLAYER_UID&platform=PC`;
const matchHistoryQueryByUID = `https://api.mozambiquehe.re/games?auth=${process.env.APEX_API}&uid=PLAYER_UID&mode=ARENAS&&start=START_TIME`;
function getPlayerStats(apexID) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield axios.get(statisticsQueryByUID.replace('PLAYER_UID', apexID));
    });
}
function getMatchHistory(apexID, startTime) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield axios.get(matchHistoryQueryByUID.replace('PLAYER_UID', apexID).replace('START_TIME', String(startTime)));
    });
}
/**
 * @param apexID apexID of the player
 * @returns true if the player has all valid trackers equipped
 */
export function hasValidTrackers(apexID) {
    return __awaiter(this, void 0, void 0, function* () {
        const stats = yield this.getPlayerStats(apexID);
        if (!('legends' in stats) || !('selected' in stats['legends'])) {
            return false;
        }
        const selected = stats['legends']['selected'];
        let trackersEnabled = 0;
        for (const tracker of selected['data']) {
            const name = tracker['name'];
            if (name === 'Arenas Wins' || name === 'Arenas Kills' || name === 'Arenas Damage') {
                trackersEnabled++;
            }
        }
        return trackersEnabled === 3;
    });
}
/**
 * @param apexID apexID of the player
 * @param startTime start time to check for game data
 * @returns games, wins, kills, and damage of the specified player
 */
export function getGameData(apexID, startTime) {
    return __awaiter(this, void 0, void 0, function* () {
        const matchHistory = yield this.getMatchHistory(apexID, startTime);
        if (Object.keys(matchHistory).length === 0) {
            return;
        }
        const gameData = {
            games: 0,
            wins: 0,
            kills: 0,
            damage: 0
        };
        for (const match of matchHistory) {
            gameData.games++;
            for (const data of match['gameData']) {
                const key = data['key'];
                switch (key) {
                    case "arenas_wins":
                        gameData.wins += data['value'];
                        break;
                    case "arenas_kills":
                        gameData.kills += data['value'];
                        break;
                    case "arenas_damage":
                        gameData.damage += data['value'];
                        break;
                }
            }
        }
        return gameData;
    });
}
