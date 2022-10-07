import { DiscordID, ApexID } from '../assets/config.js';
import { getGameData } from './data-retriever.js';

/**
 * Information about a Tournament Participant.
 */
export interface Participant {
    username: string,
    discordID: DiscordID,
    apexID: ApexID,
    gameData: GameData,
    points: number,
}

/**
 * Data about all games the Participant has played during an active Tournament.
 */
export interface GameData {
    games: number,
    wins: number,
    kills: number,
    damage: number
}

/**
 * Updates the game data of each participant, calculates their points, and sorts them by point amount.
 * @param participants list of participants
 * @param startTime start time of a tournament
 */
export async function update(participants: Participant[], startTime: number) {
    for (const participant of participants) {
        const gameData = await getGameData(participant.apexID, startTime);
        let points = 0;

        // Calculate points for the available matches.
        for (const key in gameData) {
            switch (key) {
                case "wins":
                    points += gameData[key] * 3;
                    break;
                case "kills":
                    points += gameData[key];
                    break;
                case "damage":
                    points += Math.floor(gameData[key] / 225);
                    break;
            }
        }

        participant.gameData = gameData;
        participant.points = points;
    }

    // Sort the Array in place.
    participants.sort((a, b) => b.points - a.points);
}

/**
 * Gets a formatted message of the current rankings.
 * @param participants list of participants
 * @returns formatted message listing the current rankings in a tournament
 */
export function getRankings(participants: Participant[]): string[] {
    const rankings: string[] = [];

    for (let i=0; i<participants.length; i++) {
        const participant = participants.at(i);
        const gameData = participant.gameData;

        rankings.push(`**${i+1}.** **<@${participant.discordID}>** (**${participant.points}** points)`);
        rankings.push(`:black_small_square: **${gameData.wins}** wins, **${gameData.kills}** kills, **${gameData.damage}** damage`);
        rankings.push('');
    }

    return rankings;
}