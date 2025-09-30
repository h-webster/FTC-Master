import { TeamStats } from './TeamStats';
import { TeamCharts } from './TeamCharts';
import { Matches } from './Matches';
import './TeamDashboard.css';
import storage from '../utils/storage';
import { loadTeamList } from '../loadStorageValues';
import { useState, useEffect } from 'react';
import LoadingScreenClean from './LoadingScreenClean';
import { useParams } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { useTeamDataClean } from '../hooks/useTeamDataClean';
import Header from './Header';
import { ErrorBoundary } from './ErrorBoundary';

export default function TeamDashboardClean() {
  const { teamNumber } = useParams();
  const [seasonIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [initError, setInitError] = useState(null);

  // Initialize teamMap and teamList
  useEffect(() => {
    const initData = async () => {
      try {
        if (!storage.teamList || !storage.teamMap) {
          await loadTeamList();
        }
        setReady(true);
        setInitError(null);
      } catch (error) {
        console.error('Failed to initialize team data:', error);
        setInitError('Failed to load team list. Please refresh the page.');
      }
    };
    initData();
  }, []);

  // Use the clean team data hook
  const { 
    teamData, 
    loading, 
    isLoadingTeamData,
    isLoadingExtraData,
    hasError, 
    error, 
    progress 
  } = useTeamDataClean(teamNumber, true, storage.teamMap || {});

  // Update role difference
  useEffect(() => {
    const currentSeason = teamData.seasons[seasonIndex];
    if (currentSeason?.rolePrediction) {
      storage.setRoleDiff(currentSeason.rolePrediction.percentSamples - currentSeason.rolePrediction.percentSpecimens);
    }
  }, [teamData, seasonIndex]);

  useEffect(() => {
    document.title = `FTCMaster - Team ${teamNumber}`;
  }, [teamNumber]);

  // Show loading screen if not ready or loading
  if (!ready || loading) {
    return (
      <LoadingScreenClean 
        isLoadingTeamData={isLoadingTeamData}
        isLoadingExtraData={isLoadingExtraData}
        progress={progress}
        error={initError || error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <ErrorBoundary>
      <div className='team-dashboard'>
        <Header/>
        <div className="ftc-dashboard">
          <header>
            <div className="team-title">
              <h1>Team {teamNumber} Performance</h1>
              <h2 className="team-name">{teamData.name}</h2>
            </div>
          </header>

          <TeamStats 
            mockData={teamData}
            seasonIndex={seasonIndex}
            loadedExtras={!isLoadingExtraData}
            roleDiff={storage.roleDiff}
          />

          <TeamCharts 
            season={teamData.seasons[seasonIndex]} 
            loadedExtras={!isLoadingExtraData} 
          />

          <Matches season={teamData.seasons[seasonIndex]} teamNumber={teamNumber} />
        </div>
      </div>
      <Analytics/>
      <SpeedInsights/>
    </ErrorBoundary>
  );
}
