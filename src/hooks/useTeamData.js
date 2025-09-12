import { useState, useEffect } from 'react';
import { api } from '../api';
import { getTeamData, getExtraData } from '../Query';
import { extractExtraData} from '../DataExtraction';
import { VERSION } from '../utils/constants'
import { collectTeamData } from '../CollectTeamData';

export const useTeamData = (teamNumber, submitted, teamMap) => {
  const [teamData, setTeamData] = useState({
    name: "unknown",
    seasons: [
      {
        year: '2024',
        win: 0,
        loss: 0,
        ties: 0,
        avgPoints: 0,
        autoSuccess: 0,
        rolePrediction: {
          percentSamples: 65,
          percentSpecimens: 35
        },
        events: [
        ]
      },
    ],
  });
  const [loading, setLoading] = useState(false);
  const [loadedExtras, setLoadingExtras] = useState(true);
  const [savedTeam, setSavedTeam] = useState(null);

  const fetchTeamData = async () => {
    const result = await collectTeamData(teamNumber, teamData, teamMap);
    setTeamData(result);
    setLoading(false);
    return result;
  };
  useEffect(() => {
    if (submitted) {
      async function fetchData() {
        // First, try to get data from MongoDB
        let savedTeamData = await api.getTeam(teamNumber);
        setSavedTeam(savedTeamData);
        
        if (savedTeamData && savedTeamData.version == VERSION) {
          // Use saved data from MongoDB
          console.log("Found saved team data");
          console.log(savedTeamData);
          setTeamData(savedTeamData);
          setLoading(false);
          setLoadingExtras(false);
        } else if (savedTeamData && savedTeamData.version != VERSION) {
          // Fetch fresh data from FTC API and save to MongoDB
          const teamDataResult = await fetchTeamData();

          try {
            const newDataToUpdate = {
              ...teamDataResult,
              number: teamNumber,
              version: VERSION
            };
            await api.updateTeam(teamNumber, newDataToUpdate);
            console.log("Reupdated team data in MongoDB");
          } catch (error) {
            console.error("Failed to update MongoDB:", error);
          }
        } else {
          // Fetch fresh data from FTC API and save to MongoDB
          const teamDataResult = await fetchTeamData();

          // Save to MongoDB
          try {
            const teamDataToSave = {
              ...teamDataResult,
              number: teamNumber,
              version: VERSION
            };
            console.log(teamDataToSave);
            await api.saveTeam(teamDataToSave);
            console.log("Saved team data to MongoDB");
          } catch (error) {
            console.error("Failed to save to MongoDB:", error);
          }
        }
      }
      fetchData();
    }
  }, [submitted, teamNumber]);

  useEffect(() => {
    if (submitted && !loading) {
      async function fetchExtraData() {
        if (savedTeam) {
          if (savedTeam.seasons[0].events.length == 0) {
            console.log("Didn't play so don't get extra data");
            return;
          }
          if (savedTeam.seasons[0].luckScore != -999 && savedTeam.version == VERSION) {
            setLoadingExtras(false);
            console.log("Already have extra data");
            return;
          }
        }
        if (teamData.seasons[0].events.length == 0) {
          console.log("Didn't play so don't get extra data");
          return;
        }
        const extraData = await getExtraData(teamNumber); 
        const extraDataResult = extractExtraData(extraData, teamData);
        console.log(extraDataResult);
        console.log(teamData.seasons[0].quickStats);
        setTeamData(extraDataResult);
        setLoadingExtras(false);
        
        // Update MongoDB with extra data
        try {
          const extraDataToUpdate = {
            ...extraDataResult,
            number: teamNumber
          };
          await api.updateTeam(teamNumber, extraDataToUpdate);
          console.log("Updated team data with extra info in MongoDB");
        } catch (error) {
          console.error("Failed to update MongoDB:", error);
        }
      }
      fetchExtraData();
    }
  }, [loading, savedTeam, teamNumber]);

  return { teamData, setTeamData, loading, setLoading, loadedExtras, setLoadingExtras };
};
