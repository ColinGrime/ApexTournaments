import 'dotenv/config';
import axios from 'axios';

// Discord ID: ApexUID
// Colin -> Justin -> Reese -> Braden -> Regin -> Nathan.
const playerUIDs: object = {
    "702825026830991431": "1008108433340",
    "327863472253566986": "1008861119123",
    "215917870696103942": "1006492244156",
    "314885041685790721": "1003182585982",
    "585968724994031618": "1008305005551",
    "747161801854156912": "2379527616"
};

// Apex API requests that can be made.
const statisticsQueryByUID: string = `https://api.mozambiquehe.re/bridge?auth=${process.env.APEX_API}&uid=PLAYER_UID&platform=PC`;
const matchHistoryQueryByUID: string =  `https://api.mozambiquehe.re/games?auth=${process.env.APEX_API}&uid=PLAYER_UID&mode=ARENAS&&start=START_TIME`;

// GameData object.
interface GameData {
    games: number,
    wins: number,
    kills: number,
    damage: number
}

class Stats {
    async getPlayerStats(discordID: string): Promise<object> {
        if (!(discordID in playerUIDs)) {
            return {};
        }

        return await axios.get(statisticsQueryByUID.replace('PLAYER_UID', playerUIDs[discordID]));
    }

    async getMatchHistory(discordID: string, startTime: number): Promise<object[]> {
        if (!(discordID in playerUIDs)) {
            return [];
        }

        return await axios.get(matchHistoryQueryByUID.replace('PLAYER_UID', playerUIDs[discordID]).replace('START_TIME', String(startTime)));
    }

    /**
     * @param discordID discordID of the player
     * @returns true if the player has all valid trackers equipped
     */
    async hasValidTrackers(discordID: string): Promise<boolean> {
        const stats: object = await this.getPlayerStats(discordID);
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
     * @param discordID discordID of the player
     * @param startTime start time to check for game data
     * @returns games, wins, kills, and damage of the specified player
     */
    async getGameData(discordID: string, startTime: number): Promise<GameData> {
        const matchHistory: object[] = await this.getMatchHistory(discordID, startTime);
        if (Object.keys(matchHistory).length === 0) {
            return;
        }

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
}