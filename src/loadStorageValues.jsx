import storage from './utils/storage';
import { api } from './api.js';
import { createAutocomplete } from './TeamSearch';
export async function loadTeamList() {
    let teamList;
    try {
        console.log("Getting from mongo db...");
        teamList = await api.getTeamList();
        console.log("Got Team list!!");

        // turn team list into teamMap
        const teamArray = teamList[0].teams;
        const teamDict = teamArray.reduce((acc, team) => {
            acc[team.number] = team.name;
            return acc; 
        }, {});
        storage.setTeamMap(teamDict);
    } catch (error) {
        console.error("Failed to get from MongoDB:", error);
    }
    createAutocomplete(teamList[0].teams);
    storage.setTeamList(teamList[0].teams);
}
