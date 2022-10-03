import { DiscordID, ApexID } from '../assets/config.js';
import { getGameData } from './stats.js';

/**
 * Information about a Tournament Participant.
 */
export interface Participant {
    discordID: DiscordID,
    apexID: ApexID,
    gameData?: GameData,
    points?: number,
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
    participants.sort((a, b) => a.points - b.points);
}
