import { useState, useEffect } from 'react';
import LoadingScreen from './Components/LoadingScreen';
import Header from './Components/Header';
import { TeamEntryForm } from './Components/TeamEntryForm';
import TeamDashboard from './Components/TeamDashboard';
import { createAutocomplete } from './TeamSearch';
import { useTeamData } from './hooks/useTeamData';
import { isValidTeamNumber } from './utils/teamValidation';
import { api } from './api';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { useNavigate } from 'react-router-dom';
import storage from './utils/storage';

export default function Home() {
  const navigate = useNavigate();
  const [seasonIndex] = useState(0);
  const [teamNumber, setTeamNumber] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loadedTeamList, setLoadedTeamList] = useState(false);
  const [loadedName, setLoadedName] = useState(false);

  const { teamData, loading, setLoading, setLoadingExtras } = useTeamData(teamNumber, submitted, storage.teamMap);

  // Calculate roleDiff when mockData changes
  useEffect(() => {
    if (teamData.seasons[seasonIndex]?.rolePrediction) {
      const currentSeason = teamData.seasons[seasonIndex];
      console.log(teamData.matches);
      storage.setRoleDiff(currentSeason.rolePrediction.percentSamples - currentSeason.rolePrediction.percentSpecimens);
    }
  }, [teamData, seasonIndex]);
  
  // navigate after submit
  useEffect(() => {
    if (submitted && teamNumber) {
      navigate(`/teams/${teamNumber}`);
    }
  }, [submitted, teamNumber, navigate])

  // Load team list for autocomplete
  useEffect(() => {
    async function loadTeamList() {
      let teamList;
      try {
        console.log("Getting from mongo db...");
        teamList = await api.getTeamList();
        console.log("Got Team list!!");

        // turn team list into teamMap
        const teamArray = teamList[0].teams;
        teamArray.reduce((acc, team) => {
          acc[team.number] = team.name;
          return acc; 
        }, {});
        storage.setTeamMap();
      } catch (error) {
        console.error("Failed to get from MongoDB:", error);
      }
      createAutocomplete(teamList[0].teams);
      setLoadedTeamList(true);
      storage.setTeamList(teamList[0].teams);
    }
    
    if (!loadedTeamList) {
      loadTeamList();
    }
  }, [loadedTeamList]);

  const handleSubmit = async (teamNum) => {
    if (!teamNum.trim() || isNaN(Number(teamNum))) {
      setError('Please enter a valid team number.');
      return;
    }
    
    setLoadedName(true);
    const isValid = isValidTeamNumber(teamNum, storage.teamList);
    setLoadedName(false);
    if (!isValid) {
      setError('Please enter a valid team number.');
      return;
    }
    
    setError('');
    setLoading(true);
    setLoadingExtras(true);
    setTeamNumber(teamNum);
    setSubmitted(true);
  };

  if (loading || loadedName) {
    return <LoadingScreen />;
  }

  if (!submitted) {
    return (
    <>
      <TeamEntryForm onSubmit={handleSubmit} error={error} mockData={teamData} />
      <Analytics/>
      <SpeedInsights/>
    </>
    );
  }

  return null;
}