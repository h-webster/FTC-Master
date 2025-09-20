import { EVENT_VERSION } from "./utils/constants"

export function collectEventData(eventCode, returnData) {
    returnData.version = EVENT_VERSION;
    returnData.eventCode = eventCode
    let rankings = [];

    for (let team of returnData.rankings) {
        let thisRank = {
            teamNumber: team.teamNumber,
            rank: team.rank,
            wins: team.wins,
            losses: team.losses,
            ties: team.ties,
            rp: team.sortOrder1,
            tbp: team.sortOrder2,
            ascent: team.sortOrder3,
            highScore: team.sortOrder4,
            matchesPlayed: team.matchesPlayed
        };
        rankings.push(thisRank);
    }
    returnData.rankings = rankings;

    return returnData;
}