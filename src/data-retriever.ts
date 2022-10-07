import axios from 'axios';
import { GameData } from './participant';
import { DiscordID } from '../assets/config';

// Requests that can be made.
const statisticsQueryByUID: string = `https://api.mozambiquehe.re/bridge?auth=${process.env.APEX_API}&uid=PLAYER_UID&platform=PC`;
const matchHistoryQueryByUID: string =  `https://api.mozambiquehe.re/games?auth=${process.env.APEX_API}&uid=PLAYER_UID&mode=ARENAS&&start=START_TIME`;
const newSpinningWheel: string = `https://colingrimes.dev/teams/?players=%PLAYERS%&realtime`

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

/**
 * Gets wheel link with the specified users.
 * @param usernames list of Discord usernames
 * @returns response from HTTP request of the wheel
 */
export async function getWheel(usernames: string[]) {
    return axios.get(newSpinningWheel.replace('%PLAYERS%', usernames.join(',')));
}

/**
 * Gets the wheel data from a wheel link.
 * @param link link to the wheel you want data from
 * @returns object containing the teams
 */
export async function getWheelData(link: string) {
    const res = (await axios.get(`${link}&teams`)).data;

    // If the wheel is not complete, return null.
    if (!res['isComplete']) {
        return null;
    }

    return {
        "team1": res['teams']['team1'],
        "team2": res['teams']['team2']
    }
}