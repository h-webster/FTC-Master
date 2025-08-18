import {teamRolePrediction, calculateCarriedScore} from './DataAnalysis';

export function extractExtraData(teamData, returnData) {
    console.log(teamData);
    const matches = teamData.teamByNumber.matches;
    let gamesPlayed = matches.length;
    
    let totalPartnerOpr = 0;
    let totalOpponentOpr = 0;
    for (const match of matches) {
        let theirAlliance = match.alliance;
        if (match.match.tournamentLevel != "Quals") {
            continue;
        }
        let matchOpponentOpr = 0;
        for (const team of match.match.teams) {
            let thisAlliance = team.alliance;
            let thisOPR = team.team.quickStats.tot.value;
            if (thisAlliance == theirAlliance && team.team.number != teamData.teamByNumber.number) {
                totalPartnerOpr += thisOPR;
            }
            if (thisAlliance != theirAlliance) {
                matchOpponentOpr += thisOPR;
            }
        }
        totalOpponentOpr += matchOpponentOpr / 2;
    }
    const OPR = teamData.teamByNumber.quickStats.tot.value;
    
    let luckScore = calculateCarriedScore(OPR, totalPartnerOpr, totalOpponentOpr, gamesPlayed) * 2;
    
    // Create a new season with the updated luckScore
    const newSeason = {
        ...returnData.seasons[0],
        luckScore: luckScore.toFixed(2)
    };
    
    // Create new seasons array
    const newSeasons = [newSeason, ...returnData.seasons.slice(1)];
    
    return {
        ...returnData,
        seasons: newSeasons
    };
}

export function extractTeamData(teamData, returnData) {
    let wins = 0;
    let losses = 0;
    let ties = 0;

    let specimens = [];
    let samples = [];
    let points = [];

    let gamesPlayed = 0;
    let totalPoints = 0;

    const events = teamData.teamByNumber.events;
    let processedEvents = [];

    events.sort((a, b) => {
        return new Date(b.event.start) - new Date(a.event.start);
    });

    for (let eventI = events.length - 1; eventI >= 0; eventI--) {
        let event = events[eventI];
        let i = 1;
        const matches = event.matches;
        gamesPlayed += matches.length;
        let processedQuals = [];
        let processedPlayoffs = [];
        for (const match of matches) {
            let theirAlliance = match.alliance;
            if (match.match.scores == null) {
                continue;
            }
            let red = match.match.scores.red.totalPoints;
            let blue = match.match.scores.blue.totalPoints;
            let teamPoints = 0;
            let isWin = false;

            if (theirAlliance === "Red") {
                teamPoints = red;
                totalPoints += red;
                specimens.push(match.match.scores.red.dcSpecimenPoints);
                samples.push(match.match.scores.red.dcSamplePoints);
                if (red > blue) {
                    wins++;
                    isWin = true;
                    console.log("win");
                } else if (red < blue) {
                    losses++;
                } else {
                    ties++;
                }
            }
            else {
                teamPoints = blue;
                totalPoints += blue;
                specimens.push(match.match.scores.blue.dcSpecimenPoints);
                samples.push(match.match.scores.blue.dcSamplePoints);
                if (blue > red) {
                    wins++;
                    isWin = true;
                    console.log("win");
                } else if (blue < red) {
                    losses++;
                } else {
                    ties++;
                }
            }
            let blueTeams = [];
            let redTeams = [];

            for (const team of match.match.teams) {
                if (team.alliance == "Red") {
                    redTeams.push(team.team.number);
                }
                else {
                    blueTeams.push(team.team.number);
                }
            }

            let processedMatch = {
                match: i,
                points: teamPoints,
                alliance: theirAlliance,
                redScore: red,
                blueScore: blue,
                redTeams: redTeams,
                blueTeams: blueTeams,
            }

            if (match.match.tournamentLevel == "Quals") {
                processedQuals.push(processedMatch);

                points.push({
                    points: theirAlliance == "Red" ? red : blue, 
                    matchNumber: points.length + 1,
                });
            } else {
                processedPlayoffs.push(processedMatch);
            }
            i++;
        }
        processedEvents.push({
            name: event.event.name,
            quals: processedQuals,
            playoffs: processedPlayoffs,
        });
    }
    
    console.log("specimens", specimens);
    console.log("samples", samples);
    returnData.seasons[0].win = wins;
    returnData.seasons[0].loss = losses;
    returnData.seasons[0].ties = ties;
    returnData.seasons[0].avgPoints = (totalPoints / gamesPlayed).toFixed(1);
    returnData.seasons[0].specimens = specimens;
    returnData.seasons[0].samples = samples;
    returnData.seasons[0].events = processedEvents; // Add matches to the season
    returnData.seasons[0].points = points;
    returnData.seasons[0].quickStats = teamData.teamByNumber.quickStats;
    returnData.name = teamData.teamByNumber.name;

    returnData.seasons[0].rolePrediction = teamRolePrediction(specimens, samples);
    console.log(returnData.seasons[0].rolePrediction);
    return returnData;
}