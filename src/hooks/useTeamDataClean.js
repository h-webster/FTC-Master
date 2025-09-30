import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../api';
import { getExtraData } from '../Query';
import { extractExtraData } from '../DataExtraction';
import { VERSION } from '../utils/constants';
import { collectTeamData } from '../CollectTeamData';
import { useLoadingState } from './useLoadingState';

export const useTeamDataClean = (teamNumber, submitted, teamMap = {}) => {
  const [teamData, setTeamData] = useState({
    name: "unknown",
    seasons: [
      {
        year: '2024',
        win: 0,
        loss: 0,
        ties: 0,
        avgPoints: 0,
        rolePrediction: {
          percentSamples: 65,
          percentSpecimens: 35
        },
        events: []
      },
    ],
  });
  
  const [savedTeam, setSavedTeam] = useState(null);
  const loading = useLoadingState();
  
  // Use ref to get current teamData without causing re-renders
  const teamDataRef = useRef(teamData);
  teamDataRef.current = teamData;

  const resetTeamData = useCallback(() => {
    setTeamData(prevTeamData => ({
      ...prevTeamData,
      aiInsight: undefined,
      luckScore: undefined
    }));
  }, []);

  // Fetch fresh team data
  const fetchTeamData = useCallback(async () => {
    try {
      loading.startTeamDataFetch();
      const result = await collectTeamData(teamNumber, teamDataRef.current, teamMap);
      setTeamData(result);
      loading.completeTeamDataFetch();
      return result;
    } catch (error) {
      loading.setError(`Failed to fetch team data: ${error.message}`);
      throw error;
    }
  }, [teamNumber, teamMap, loading]);

  // Fetch extra data (AI insights, luck score)
  const fetchExtraData = useCallback(async () => {
    try {
      // Check if we already have extra data for this team
      if (savedTeam && savedTeam.number === teamNumber) {
        if (savedTeam.seasons[0].events.length === 0) {
          return; // No events, no extra data needed
        }
        if (savedTeam.seasons[0].luckScore !== -999 && savedTeam.version === VERSION) {
          return; // Already have extra data
        }
      }

      // Check if current team data has events
      if (teamData.seasons[0].events.length === 0) {
        return; // No events, no extra data needed
      }

      loading.startExtraDataFetch();
      resetTeamData();
      
      const extraRaw = await getExtraData(teamNumber);
      const extraResult = await extractExtraData(extraRaw, teamDataRef.current);
      
      setTeamData(extraResult);
      loading.completeExtraDataFetch();

      // Save to database
      await api.updateTeam(teamNumber, { ...extraResult, number: teamNumber });
      
    } catch (error) {
      loading.setError(`Failed to fetch extra data: ${error.message}`);
      console.error("Failed to fetch/update extra data:", error);
    }
  }, [savedTeam, teamNumber, teamData.seasons[0].events.length, loading, resetTeamData]);

  // Main data fetching effect
  useEffect(() => {
    if (!submitted || !teamMap || Object.keys(teamMap).length === 0) return;

    const fetchData = async () => {
      try {
        loading.reset();
        
        // Try to get saved team data first
        const savedTeamData = await api.getTeam(teamNumber);
        setSavedTeam(savedTeamData);

        if (savedTeamData && savedTeamData.version === VERSION) {
          // Use cached data
          setTeamData(savedTeamData);
          loading.completeTeamDataFetch();
          
          // Check if we need to fetch extra data
          if (savedTeamData.seasons[0].events.length > 0 && 
              (savedTeamData.seasons[0].luckScore === -999 || savedTeamData.version !== VERSION)) {
            await fetchExtraData();
          } else {
            loading.completeExtraDataFetch();
          }
        } else {
          // Fetch fresh data
          const freshData = await fetchTeamData();
          const payload = { ...freshData, number: teamNumber, version: VERSION };
          
          try {
            if (savedTeamData) {
              await api.updateTeam(teamNumber, payload);
            } else {
              await api.saveTeam(payload);
            }
          } catch (err) {
            console.error("Failed to save/update MongoDB:", err);
            loading.setError(`Failed to save team data: ${err.message}`);
          }

          // Fetch extra data
          await fetchExtraData();
        }
      } catch (error) {
        loading.setError(`Failed to load team data: ${error.message}`);
      }
    };

    fetchData();
  }, [submitted, teamNumber, teamMap, fetchTeamData, fetchExtraData, loading]);

  // Reset when team changes
  useEffect(() => {
    if (teamNumber) {
      setSavedTeam(null);
      loading.reset();
      resetTeamData();
    }
  }, [teamNumber, loading, resetTeamData]);

  return { 
    teamData, 
    setTeamData, 
    loading: loading.isLoading,
    isLoadingTeamData: loading.isLoadingTeamData,
    isLoadingExtraData: loading.isLoadingExtraData,
    hasError: loading.hasError,
    error: loading.error,
    progress: loading.progress
  };
};
