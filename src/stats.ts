import axios from 'axios';
import { GameData } from './participant';

// Apex API requests that can be made.
const statisticsQueryByUID: string = `https://api.mozambiquehe.re/bridge?auth=${process.env.APEX_API}&uid=PLAYER_UID&platform=PC`;
const matchHistoryQueryByUID: string =  `https://api.mozambiquehe.re/games?auth=${process.env.APEX_API}&uid=PLAYER_UID&mode=ARENAS&&start=START_TIME`;

async function getPlayerStats(apexID: string): Promise<object> {
    return await axios.get(statisticsQueryByUID.replace('PLAYER_UID', apexID));
}

async function getMatchHistory(apexID: string, startTime: number): Promise<object[]> {
    return await axios.get(matchHistoryQueryByUID.replace('PLAYER_UID', apexID).replace('START_TIME', String(startTime)));
}

/**
 * @param apexID apexID of the player
 * @returns true if the player has all valid trackers equipped
 */
export async function hasValidTrackers(apexID: string): Promise<boolean> {
    const stats: object = (await getPlayerStats(apexID))['data'];
    if (!('legends' in stats) || !('selected' in stats['legends'])) {
        return false;
    }

    const selected: object = stats['legends']['selected'];
    let trackersEnabled = 0;

    for (const tracker of selected['data']) {
        const name = tracker['name'];
        if (name === 'Arenas Wins' || name === 'Arenas Kills' || name === 'Arenas Damage') {
            trackersEnabled++;
        }
    }

    return trackersEnabled === 3;
}

/**
 * @param apexID apexID of the player
 * @param startTime start time to check for game data
 * @returns games, wins, kills, and damage of the specified player
 */
export async function getGameData(apexID: string, startTime: number): Promise<GameData> {
    const matchHistory: object[] = (await getMatchHistory(apexID, startTime))['data'];
    const gameData: GameData = {
        games: 0,
        wins: 0,
        kills: 0,
        damage: 0
    }

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
}