import {teamRolePrediction, calculateCarriedScore} from './DataAnalysis';
import { officialAPI } from './hooks/useEventsData';
import { scoutAPI } from './hooks/useRest';
import { TeamNotFound } from './Fancy';


export function extractExtraData(teamData, returnData) {
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


export async function collectTeamData(teamNumber, returnData, teamMap) {
    returnData.name = teamMap[teamNumber];
    returnData.seasons[0].rookieYear = "Not Found";

    const thisTeam = await getThisTeam(teamNumber);
    if (TeamNotFound(thisTeam)) return returnData;

    console.log("Got this team!");
    console.log("This Team: " + JSON.stringify(thisTeam));

    returnData.seasons[0].rookieYear = thisTeam.teams[0].rookieYear;

    const data = await officialAPI.getEventsData(teamNumber);
    if (data == null) {
        return returnData;
    }
    if (data.events.length == 0) {
        return returnData;
    }

    console.log("Data: " + JSON.stringify(data));
    let wins = 0;
    let losses = 0;
    let ties = 0; 

    let points = [];
    let gamesPlayed = 0;
    let totalPoints = 0;

    let samples = [];
    let specimens = [];

    const events = data.events;

    let processedEvents = [];

    events.sort((a, b) => {
        return new Date(b.dateStart) - new Date(a.dateStart);
    });

    let allMatches = [];
    for (let eventI = events.length - 1; eventI >= 0; eventI--) {
        let event = events[eventI];

        const eventData = await officialAPI.getMatchesData(event.code);
        console.log("Got matches for Event " + event.name);

        let processedQuals = [];
        let processedPlayoffs = [];

        

        let scoreByQualMatch;
        let scoreByPlayoffMatch;
        scoreByQualMatch = await setScoreDetails(event.code);
        console.log("Got score details for Event " + event.name);

        const specimenSamples = getSpecimensSamples(teamNumber, eventData.matches, scoreByQualMatch);
        console.log("Got specimens and samples!");
        console.log("Specimens: " + specimenSamples.specimens + "\n" + "Samples: " + specimenSamples.samples);
    
        samples = [...samples, ...specimenSamples.samples];
        specimens = [...specimens, ...specimenSamples.specimens];

        for (let match of eventData.matches) {
            allMatches.push(match);
            let blueTeams = [];
            let redTeams = [];
            let teamPoints = 0;
            let theirAlliance = "";
            let red = 0;
            let blue = 0;

            let containsTeam = false;
            for (let team of match.teams) {
                const toPushTeam = {
                    name: teamMap[team.teamNumber],
                    number: team.teamNumber,
                };

                if (team.station[0] == "R") {
                    redTeams.push(toPushTeam);
                }
                else {
                    blueTeams.push(toPushTeam);
                }

                //this match had your team play
                if (team.teamNumber == teamNumber) {
                    containsTeam = true;
                    gamesPlayed++;

                    

                    red = match.scoreRedFinal;
                    blue = match.scoreBlueFinal;

                    if (red == blue) {
                        ties++;
                    }
                    if (team.station[0] == "R") {
                        totalPoints += red;
                        theirAlliance = "Red";
                        teamPoints = red;
                        if (red > blue) {
                            wins++;
                            continue;
                        }
                        losses++;
                    }
                    else {
                        totalPoints += blue;
                        teamPoints = blue;
                        theirAlliance = "Blue";
                        if (blue > red) {
                            wins++;
                            continue;
                        }
                        losses++;
                    }
                }
            }
            if (!containsTeam) {
                continue;
            }
            let processedMatch = {
                match: match.matchNumber,
                points: teamPoints,
                alliance: theirAlliance,
                redScore: red,
                blueScore: blue,
                redTeams: redTeams,
                blueTeams: blueTeams,
            }
            //console.log(processedMatch.redTeams);
            //console.log(processedMatch.blueTeams);

            if (match.tournamentLevel == "QUALIFICATION") {
                processedQuals.push(processedMatch);

                points.push({
                    points: theirAlliance == "Red" ? red : blue, 
                    matchNumber: points.length + 1,
                });
            } else {
                processedPlayoffs.push(processedMatch);
            }
        }
        processedEvents.push({
            name: event.name,
            quals: processedQuals,
            playoffs: processedPlayoffs,
        });
    }
    console.log(JSON.stringify(data));

    console.log("Getting QuickStats!");
    const quickStats = await getQuickStats(teamNumber);
    console.log("Got QuickStats!");
    console.log("Quick stats:  " + quickStats);

    

    console.log("Events: ", processedEvents);

    


    console.log("Getting OPR")

    console.log(samples);
    

    returnData.seasons[0].win = wins;
    returnData.seasons[0].loss = losses;
    returnData.seasons[0].ties = ties;
    returnData.seasons[0].avgPoints = (totalPoints / gamesPlayed).toFixed(1);
    returnData.seasons[0].specimens = specimens;
    returnData.seasons[0].samples = samples;
    returnData.seasons[0].events = processedEvents; // Add matches to the season
    returnData.seasons[0].points = points;

    returnData.seasons[0].quickStats = quickStats;

    returnData.seasons[0].sponsors = [];

    returnData.seasons[0].rolePrediction = teamRolePrediction(specimens, samples);
    console.log(returnData.seasons[0].rolePrediction);
    return returnData;
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

function getSpecimensSamples(teamNumber, matches, scoreByMatch) {
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

async function getQuickStats(teamNumber) {
    const quickStatsData = await scoutAPI.getQuickStats(teamNumber);
    return quickStatsData;
}

async function getThisTeam(teamNumber) {
    const thisTeamData = await officialAPI.getTeamData(teamNumber);
    return thisTeamData;
}

async function getScoreDetails(eventCode, teamNumber) {
    const qualScoreDetails = await officialAPI.getScoreDetails(eventCode, "qual", teamNumber);
    console.log(`Got ${eventCode} qual score details`);
    const playoffScoreDetails = await officialAPI.getScoreDetails(eventCode, "playoff", teamNumber);
    console.log(`Got ${eventCode} playoff score details`);


    qualScoreDetails.matchScores
}