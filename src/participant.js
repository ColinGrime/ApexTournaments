var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getGameData } from './stats.js';
export function update(participants, startTime) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const participant of participants) {
            const gameData = yield getGameData(participant.apexID, startTime);
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
    });
}
