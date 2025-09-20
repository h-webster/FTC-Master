import { useState, useEffect } from 'react';
import { api } from '../api';
import { getExtraData } from '../Query';
import { extractExtraData } from '../DataExtraction';
import { VERSION } from '../utils/constants';
import { collectTeamData } from '../CollectTeamData';

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
        autoSuccess: 0,
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

  // Fetch fresh team data
  const fetchTeamData = async () => {
    const result = await collectTeamData(teamNumber, teamData, teamMap);
    setTeamData(result);
    setLoading(false);
    return result;
  };

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
  }, [submitted, teamNumber, teamMap]);

  // Effect: load extra data
  useEffect(() => {
    if (!submitted || loading) return;

    const fetchExtraData = async () => {
      if (savedTeam) {
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
        const extraRaw = await getExtraData(teamNumber);
        const extraResult = extractExtraData(extraRaw, teamData);
        setTeamData(extraResult);
        setLoadingExtras(false);

        await api.updateTeam(teamNumber, { ...extraResult, number: teamNumber });
      } catch (err) {
        console.error("Failed to fetch/update extra data:", err);
      }
    };

    fetchExtraData();
  }, [loading, savedTeam, teamNumber, submitted]);

  return { teamData, setTeamData, loading, setLoading, loadedExtras, setLoadingExtras };
};
