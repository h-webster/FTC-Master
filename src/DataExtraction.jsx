import { calculateCarriedScore} from './DataAnalysis';
import { officialAPI } from './hooks/useEventsData';
import { scoutAPI } from './hooks/useRest';
import { TeamNotFound } from './Fancy';
import { api } from './api';
import { openAPI } from './hooks/useAi';


export async function extractExtraData(teamData, returnData) {
    console.log(teamData);
    const matches = teamData.teamByNumber.matches;
    let games = [];

    for (const match of matches) {
        let theirAlliance = match.alliance;
        if (match.match.tournamentLevel != "Quals") {
            continue;
        }
        let partnerOpr = 0;
        let opponentOpr = 0;
        for (const team of match.match.teams) {
            let thisAlliance = team.alliance;
            if (team.team.quickStats == null) {
                break;
            }
            let thisOPR = team.team.quickStats.tot.value;
            if (thisAlliance == theirAlliance && team.team.number != teamData.teamByNumber.number) {
                partnerOpr += thisOPR;
            }
            if (thisAlliance != theirAlliance) {
                opponentOpr += thisOPR;
            }
        }
        games.push({
            partner: partnerOpr,
            opponent: opponentOpr / 2
        });
    }
    const OPR = teamData.teamByNumber.quickStats.tot.value;
    let totalPartnerOpr = 0;
    let totalOpponentOpr = 0;
    for (let game of games) {
        totalPartnerOpr += game.partner;
        totalOpponentOpr += game.opponent;
    }
    let luckScore = calculateCarriedScore(OPR, totalPartnerOpr, totalOpponentOpr, games.length) * 2;
    let analysis = await openAPI.getAIRequest(returnData);
    // Create a new season with the updated luckScore
    const newSeason = {
        ...returnData.seasons[0],
        luckScore: luckScore.toFixed(2),
        aiInsight: analysis
    };
    
    // Create new seasons array
    const newSeasons = [newSeason, ...returnData.seasons.slice(1)];
    
    return {
        ...returnData,
        seasons: newSeasons
    };
}


export async function setScoreDetails(eventCode) {
    const qualScoreDetails = await officialAPI.getScoreDetails(eventCode, "qual");
    console.log(`Got ${eventCode} qual score details`);
    const scoreByQualMatch = new Map();
    for (const score of qualScoreDetails.matchScores) {
        scoreByQualMatch.set(score.matchNumber, score);
    }

    /*
    const playoffScoreDetails = await officialAPI.getScoreDetails(eventCode, "playoff", teamNumber);
    console.log(`Got ${eventCode} playoff score details`);
    const scoreByPlayoffMatch = new Map();
    for (const score of playoffScoreDetails.matchScores) {
        scoreByPlayoffMatch.set(score.matchNumber, score);
    }
    */
    return scoreByQualMatch;
} 

export function getSpecimensSamples(teamNumber, matches, scoreByMatch) {
    //console.log(JSON.stringify(qualScoreDetails));

    let samples = [];
    let specimens = [];

    for (let match of matches) {
        //console.log("Match: " + match.matchNumber);
        if (match.tournamentLevel != "QUALIFICATION") continue;
        //console.log("Is Qualification");
        const score = scoreByMatch.get(match.matchNumber);
        if (!score) continue;
        //console.log("Is Correct Match")

        const team = match.teams.find(t => t.teamNumber == teamNumber);
        if (!team) continue;
        const alliance = team.station[0] === 'R' ? 'Red' : 'Blue';

        const side = score.alliances.find(a => a.alliance === alliance);
        if (!side) continue;

        //console.log("Push sample and specimen");
        samples.push(side.teleopSampleNet * 2 + side.teleopSampleLow * 4 + side.teleopSampleHigh * 8);
        specimens.push(side.teleopSpecimenLow * 6 + side.teleopSpecimenHigh * 10);
    }
    return {
        samples: samples,
        specimens: specimens
    };
}

export async function getQuickStats(teamNumber) {
    const quickStatsData = await scoutAPI.getQuickStats(teamNumber);
    return quickStatsData;
}

export async function getThisTeam(teamNumber) {
    const thisTeamData = await officialAPI.getTeamData(teamNumber);
    return thisTeamData;
}

export async function getScoreDetails(eventCode, teamNumber) {
    const qualScoreDetails = await officialAPI.getScoreDetails(eventCode, "qual", teamNumber);
    console.log(`Got ${eventCode} qual score details`);
    const playoffScoreDetails = await officialAPI.getScoreDetails(eventCode, "playoff", teamNumber);
    console.log(`Got ${eventCode} playoff score details`);

    const scoreByQualMatch = new Map();
    for (const score of qualScoreDetails.matchScores) {
        scoreByQualMatch.set(score.matchNumber, score);
    }

    const scoreByPlayoffMatch = new Map();
    for (const score of playoffScoreDetails.matchScores) {
        scoreByPlayoffMatch.set(score.matchNumber, score);
    }

    return {
        qual: scoreByQualMatch,
        playoff: scoreByPlayoffMatch
    };
}