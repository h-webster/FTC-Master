import { useState, useEffect } from 'react';
import './App.css';
import LoadingScreen from './Components/LoadingScreen';
import { TeamEntryForm } from './Components/TeamEntryForm';
import { TeamDashboard } from './Components/TeamDashboard';
import { createAutocomplete } from './TeamSearch';
import { useTeamData } from './hooks/useTeamData';
import { isValidTeamNumber } from './utils/teamValidation';
import { api } from './api';

function App() {
  const [seasonIndex, setSeasonIndex] = useState(0);
  const [teamNumber, setTeamNumber] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loadedTeamList, setLoadedTeamList] = useState(false);
  const [roleDiff, setRoleDiff] = useState(0);
  const [loadedName, setLoadedName] = useState(false);

  const { mockData, setMockData, loading, setLoading, loadedExtras, setLoadingExtras } = useTeamData(teamNumber, submitted);

  // Calculate roleDiff when mockData changes
  useEffect(() => {
    if (mockData.seasons[seasonIndex]?.rolePrediction) {
      const currentSeason = mockData.seasons[seasonIndex];
      console.log(mockData.matches);
      setRoleDiff(currentSeason.rolePrediction.percentSamples - currentSeason.rolePrediction.percentSpecimens);
    }
  }, [mockData, seasonIndex]);

  // Load team list for autocomplete
  useEffect(() => {
    async function loadTeamList() {
      let teamList;
      try {
        console.log("Getting from mongo db...");
        teamList = await api.getTeamList();
        console.log("Team list: " + JSON.stringify(teamList[0].teams));
      } catch (error) {
        console.error("Failed to get from MongoDB:", error);
      }

      createAutocomplete(teamList[0].teams);
      setLoadedTeamList(true);
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
    const isValid = await isValidTeamNumber(teamNum);
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
    return <TeamEntryForm onSubmit={handleSubmit} error={error} />;
  }

  return (
    <TeamDashboard 
      teamNumber={teamNumber}
      mockData={mockData}
      seasonIndex={seasonIndex}
      loadedExtras={loadedExtras}
      roleDiff={roleDiff}
    />
  );
}

export default App;
