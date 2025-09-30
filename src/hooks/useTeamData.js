import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../api';
import { getExtraData } from '../Query';
import { extractExtraData } from '../DataExtraction';
import { VERSION } from '../utils/constants';
import { collectTeamData } from '../CollectTeamData';
import storage from '../utils/storage';

export const useTeamData = (teamNumber, submitted, teamMap = {}) => {
  // Top-level hooks — always called
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
  const [loading, setLoading] = useState(false);
  const [loadedExtras, setLoadingExtras] = useState(true);
  const [savedTeam, setSavedTeam] = useState(null);
  
  // Use ref to get current teamData without causing re-renders
  const teamDataRef = useRef(teamData);
  teamDataRef.current = teamData;

  const resetExtraData = useCallback(() => {
    setTeamData(prevTeamData => ({
      ...prevTeamData,
      aiInsight: undefined,
      luckScore: undefined
    }));
  }, []);
  
  // Fetch fresh team data
  const fetchTeamData = useCallback(async () => {
    const result = await collectTeamData(teamNumber, teamDataRef.current, teamMap);
    setTeamData(result);
    setLoading(false);
    return result;
  }, [teamNumber, teamMap]);

  // Fetch extra data
  const fetchExtraData = useCallback(async () => {
    if (savedTeam && savedTeam.number === teamNumber) {
      if (savedTeam.seasons[0].events.length === 0) {
        setLoadingExtras(false);
        return;
      }
      if (savedTeam.seasons[0].luckScore !== -999 && savedTeam.version === VERSION) {
        setLoadingExtras(false);
        return;
      }
    }

    if (teamData.seasons[0].events.length === 0) {
      setLoadingExtras(false);
      return;
    }


    try {
      resetExtraData();
      console.log(`Fetching extra data for team ${teamNumber}`);
      const extraRaw = await getExtraData(teamNumber);
      console.log(`Extra raw data team number:`, extraRaw?.teamByNumber?.number);
      const extraResult = await extractExtraData(extraRaw, teamDataRef.current);
      console.log("Current loading extras state:", loadedExtras);
      console.log(`Extra result team number:`, extraResult.number);
      console.log(`Extra result quickStats number:`, extraResult.seasons[0]?.quickStats?.number);
      setTeamData(extraResult);
      setLoadingExtras(false);
      storage.setLoadingExtras(false);
      console.log("Done fetching extra data!");

      await api.updateTeam(teamNumber, { ...extraResult, number: teamNumber });
    } catch (err) {
      console.error("Failed to fetch/update extra data:", err);
      setLoadingExtras(false);
      storage.setLoadingExtras(false);
    }
  }, [savedTeam, teamNumber]);

  // Effect: load main team data
  useEffect(() => {
    if (!submitted || !teamMap || Object.keys(teamMap).length === 0) return;

    const fetchData = async () => {
      setLoading(true);
      let savedTeamData = await api.getTeam(teamNumber);
      setSavedTeam(savedTeamData);

      if (savedTeamData && savedTeamData.version === VERSION) {
        setTeamData(savedTeamData);
        setLoading(false);
        setLoadingExtras(false);
      } else {
        const freshData = await fetchTeamData();
        console.log(`Fresh data for team ${teamNumber}:`, freshData);
        console.log(`Fresh data quickStats number:`, freshData.seasons[0]?.quickStats?.number);
        const payload = { ...freshData, number: teamNumber, version: VERSION };
        try {
          if (savedTeamData) await api.updateTeam(teamNumber, payload);
          else await api.saveTeam(payload);
        } catch (err) {
          console.error("Failed to save/update MongoDB:", err);
        }
      }


    };

    fetchData();
  }, [submitted, teamNumber, teamMap, fetchTeamData]);

  // Effect: load extra data
  useEffect(() => {
    if (!submitted || loading) return;

    console.log(`useEffect triggered - loading: ${loading}, savedTeam: ${savedTeam?.number}, teamNumber: ${teamNumber}, submitted: ${submitted}`);
    fetchExtraData();
  }, [loading, savedTeam, teamNumber, submitted]);

  useEffect(() => {
    console.log("loadedExtras changed:", loadedExtras);
    if (!loadedExtras) {
      console.log("Finished loading extras!");
    }
  }, [loadedExtras]);

  useEffect(() => {
    console.log("New team number or submission, resetting states.");
    setSavedTeam(null);
    setLoading(true);
    storage.setLoadingExtras(true);
    setLoadingExtras(true);
    // Clear any existing AI insight data to prevent stale data
    setTeamData(prevTeamData => ({
      ...prevTeamData,
      aiInsight: undefined,
      luckScore: undefined
    }));
  }, [teamNumber]);
  return { teamData, setTeamData, loading, setLoading, loadedExtras, setLoadingExtras };
};
