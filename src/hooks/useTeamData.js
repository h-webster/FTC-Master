import { useState, useEffect } from 'react';
import { api } from '../api';
import { getTeamData, getExtraData } from '../Query';
import { extractTeamData, extractExtraData } from '../DataExtraction';
import { VERSION } from '../utils/constants'


export const useTeamData = (teamNumber, submitted) => {
  const [mockData, setMockData] = useState({
    name: "unknown",
    seasons: [
      {
        year: '2024',
        win: 18,
        loss: 7,
        ties: 2,
        avgPoints: 120,
        autoSuccess: 0.75,
        rolePrediction: {
          percentSamples: 65,
          percentSpecimens: 35
        },
        events: [
          {
            name: "Last Chance",
            matches: [
              { match: 1, points: 110, auto: true },
              { match: 2, points: 130, auto: false },
              { match: 3, points: 120, auto: true },
            ],
            luckScore: -999,
          }
        ]
      },
    ],
  });
  const [loading, setLoading] = useState(false);
  const [loadedExtras, setLoadingExtras] = useState(true);
  const [savedTeam, setSavedTeam] = useState(null);

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
          setMockData(savedTeamData);
          setLoading(false);
          setLoadingExtras(false);
        } else if (savedTeamData && savedTeamData.version != VERSION) {
          // Fetch fresh data from FTC API and save to MongoDB
          const data = await getTeamData(teamNumber);
          console.log("Got API data");
          const teamDataResult = extractTeamData(data, mockData);
          setMockData(teamDataResult);
          setLoading(false);

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
          const data = await getTeamData(teamNumber);
          console.log("Got API data");
          const teamDataResult = extractTeamData(data, mockData);
          setMockData(teamDataResult);
          setLoading(false);
          
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
          if (savedTeam.seasons[0].luckScore != 5.37 && savedTeam.version == VERSION) {
            setLoadingExtras(false);
            console.log("Already have extra data");
            return;
          }
        }
        const extraData = await getExtraData(teamNumber); 
        const extraDataResult = extractExtraData(extraData, mockData);
        console.log(extraDataResult);
        console.log(mockData.seasons[0].quickStats);
        setMockData(extraDataResult);
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

  return { mockData, setMockData, loading, setLoading, loadedExtras, setLoadingExtras };
};
