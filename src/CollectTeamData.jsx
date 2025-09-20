import { officialAPI } from './hooks/useEventsData';
import { scoutAPI } from './hooks/useRest';
import { api } from './api';
import { EVENT_VERSION } from './utils/constants';
import { getSpecimensSamples, setScoreDetails, getThisTeam, getQuickStats } from './DataExtraction';
import { TeamNotFound } from './Fancy';
import {teamRolePrediction} from './DataAnalysis'
import { collectEventData } from './CollectEventData';

export async function collectTeamData(teamNumber, returnData, teamMap) {
    returnData.name = teamMap[teamNumber];
    returnData.seasons[0].rookieYear = "Not Found";
    returnData.seasons[0].location = "Unknown";

    const thisTeam = await getThisTeam(teamNumber);
    if (TeamNotFound(thisTeam)) return returnData;

    returnData.seasons[0].location = thisTeam.teams[0].city + ", " + thisTeam.teams[0].stateProv + ", " + thisTeam.teams[0].country;

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

        let eventRanking = await api.getEventRankings(event.code);
        if (!eventRanking || eventRanking.version !== EVENT_VERSION) {
            eventRanking = await officialAPI.getRankingsData(event.code);
            console.log("Got fresh event rankings for Event " + event.name);
            eventRanking = collectEventData(event.code, eventRanking);
            console.log("Event Ranking (Fresh): " + JSON.stringify(eventRanking));
            await api.saveEventRankings(eventRanking);
        } else {
            console.log("Found event ranking data in API");
            console.log("Event Ranking: " + JSON.stringify(eventRanking));
        }
        let rank;
        if (eventRanking.rankings.length == 0) {
            rank = -1;
        } else {
            rank = eventRanking.rankings.find(r => r.teamNumber == teamNumber).rank;
        }

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
        let dateStart = new Date(event.dateStart);
        let dateEnd = new Date(event.dateEnd);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };

        // Check if dateStart is valid
        const formattedDateStart = isNaN(dateStart.getTime()) ? "Unknown" : dateStart.toLocaleDateString('en-US', options);

        // Check if dateEnd is valid
        const formattedDateEnd = isNaN(dateEnd.getTime()) ? "Unknown" : dateEnd.toLocaleDateString('en-US', options);

        processedEvents.push({
            name: event.name,
            quals: processedQuals,
            playoffs: processedPlayoffs,
            dateStart: formattedDateStart,
            dateEnd: formattedDateEnd,
            rank: rank,
            teams: eventRanking.rankings.length,
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
    console.log(returnData);
    return returnData;
}