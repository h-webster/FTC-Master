import { useState, useEffect } from 'react';
import './App.css';
import LoadingScreen from './Components/LoadingScreen';
import Header from './Components/Header';
import { TeamEntryForm } from './Components/TeamEntryForm';
import { TeamDashboard } from './Components/TeamDashboard';
import { createAutocomplete } from './TeamSearch';
import { useTeamData } from './hooks/useTeamData';
import { isValidTeamNumber } from './utils/teamValidation';
import { api } from './api';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

function App() {
  const [seasonIndex, setSeasonIndex] = useState(0);
  const [teamNumber, setTeamNumber] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loadedTeamList, setLoadedTeamList] = useState(false);
  const [roleDiff, setRoleDiff] = useState(0);
  const [loadedName, setLoadedName] = useState(false);
  const [teamList, setTeamList] = useState(null);
  const [teamMap, setTeamMap] = useState(null);

  const { teamData, setTeamData, loading, setLoading, loadedExtras, setLoadingExtras } = useTeamData(teamNumber, submitted, teamMap);


  // Calculate roleDiff when mockData changes
  useEffect(() => {
    if (teamData.seasons[seasonIndex]?.rolePrediction) {
      const currentSeason = teamData.seasons[seasonIndex];
      console.log(teamData.matches);
      setRoleDiff(currentSeason.rolePrediction.percentSamples - currentSeason.rolePrediction.percentSpecimens);
    }
  }, [teamData, seasonIndex]);

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
        const teamDict = teamArray.reduce((acc, team) => {
          acc[team.number] = team.name;
          return acc; 
        }, {});
        setTeamMap(teamDict);
      } catch (error) {
        console.error("Failed to get from MongoDB:", error);
      }
      createAutocomplete(teamList[0].teams);
      setLoadedTeamList(true);
      setTeamList(teamList[0].teams);
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
    const isValid = isValidTeamNumber(teamNum, teamList);
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

  return (
    <>
      <TeamDashboard 
      teamNumber={teamNumber}
      mockData={teamData}
      seasonIndex={seasonIndex}
      loadedExtras={loadedExtras}
      roleDiff={roleDiff}
      />
      <Analytics/>
      <SpeedInsights/>
    </>
    
  );
}

export default App;
