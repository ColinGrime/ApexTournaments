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
const matchHistoryQueryByUID: string =  `https://api.mozambiquehe.re/bridge?auth=${process.env.APEX_API}&uid=PLAYER_UID&platform=PC&history=1&action=get`;

class Stats {
    async getPlayerStats(discordID: string): Promise<object> {
        if (!(discordID in playerUIDs)) {
            return;
        }

        const stats = axios.get(`https://api.mozambiquehe.re/bridge?auth=${process.env.APEX_API}&uid=1008108433340&platform=PC`).then(res => {
    console.log(res.data);
});
    }
}