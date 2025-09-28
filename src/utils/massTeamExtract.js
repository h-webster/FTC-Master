import { VERSION } from './constants';
import { api } from '../api';
import { getTeamData } from '../Query';
import { collectTeamData } from '../CollectTeamData';

export async function massTeamExtraction() {
    console.log("DISABLED");
    return null;
    // const numberData = await getAllTeamNumbers();
    // console.log("Extracting team number data");

    // for (let team of numberData.teamsSearch) {
    //     await runTeamNumber(team.number, mockData);
    // }
}

async function _runTeamNumber(teamNum, mockData) {
    // First, try to get data from MongoDB
    let savedTeamData = await api.getTeam(teamNum);
    if (savedTeamData && savedTeamData.version == VERSION) {
        // Use saved data from MongoDB
        console.log(`Found saved team ${teamNum} data`);
    } else if (savedTeamData && savedTeamData.version != VERSION) {
        // Fetch fresh data from FTC API and save to MongoDB
        console.log(`Found saved team ${teamNum} data ~ WRONG VERSION`);
        const data = await getTeamData(teamNum);
        console.log(`Got ${teamNum} API data`);
        const teamDataResult = await collectTeamData(teamNum, data, mockData);
        try {
            const newDataToUpdate = {
                ...teamDataResult,
                number: teamNum,
                version: VERSION
            };
            await api.updateTeam(teamNum, newDataToUpdate);
            console.log(`Reupdated team ${teamNum} data in MongoDB`);
        } catch (error) {
            console.error("Failed to update MongoDB:", error);
        }
    } else {
        // Fetch fresh data from FTC API and save to MongoDB
        console.log(`Fetching team ${teamNum} api data`);
        const data = await getTeamData(teamNum);
        console.log(`Got ${teamNum} API data`);
        const teamDataResult = await collectTeamData(teamNum, data, mockData);
        
        // Save to MongoDB
        try {
            const teamDataToSave = {
                ...teamDataResult,
                number: teamNum,
                version: VERSION
            };
            await api.saveTeam(teamDataToSave);
            console.log(`Saved team ${teamNum} data to MongoDB`);
        } catch (error) {
            console.error("Failed to save to MongoDB:", error);
        }
    }
}
