import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

// Components
import Header from './Header';
import { TeamStats } from './TeamStats';
import { TeamCharts } from './TeamCharts';
import { Matches } from './Matches';
import AIInsight from './AIInsight';
import LoadingManager from './LoadingManager';

// Hooks and utilities
import { useTeamDataManager } from '../hooks/useTeamDataManager';
import storage from '../utils/storage';
import { loadTeamList } from '../loadStorageValues';

// Styles
import './TeamDashboard.css';

export default function TeamDashboardNew() {
  const { teamNumber } = useParams();
  const [seasonIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [initError, setInitError] = useState(null);

  // Initialize team data
  const {
    teamData,
    isLoading,
    isLoadingTeamData,
    isLoadingExtraData,
    isTeamDataReady,
    hasError,
    error,
    progress,
    retry
  } = useTeamDataManager(teamNumber, true, storage.teamMap || {});

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

  // Update role difference when team data changes
  useEffect(() => {
    const currentSeason = teamData.seasons[seasonIndex];
    if (currentSeason?.rolePrediction) {
      storage.setRoleDiff(
        currentSeason.rolePrediction.percentSamples - 
        currentSeason.rolePrediction.percentSpecimens
      );
    }
  }, [teamData, seasonIndex]);

  // Update document title
  useEffect(() => {
    document.title = `FTCMaster - Team ${teamNumber}`;
  }, [teamNumber]);

  // Handle retry with initialization error
  const handleRetry = () => {
    if (initError) {
      window.location.reload();
    } else {
      retry();
    }
  };

  // Show loading/error state only for initial team data loading
  if (!ready || isLoading || hasError || initError) {
    return (
      <LoadingManager
        loadingState={isLoading ? 'loading' : 'error'}
        isLoadingTeamData={isLoadingTeamData}
        isLoadingExtraData={false} // Don't show AI loading in main screen
        progress={progress}
        error={initError || error}
        onRetry={handleRetry}
      >
        <div>Loading...</div>
      </LoadingManager>
    );
  }

  // Main dashboard content
  return (
    <div className='team-dashboard'>
      <Header/>
      <div className="ftc-dashboard">
        <header>
          <div className="team-title">
            <h1>Team {teamNumber} Performance</h1>
            <h2 className="team-name">{teamData.name}</h2>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Team Stats */}
          <TeamStats 
            mockData={teamData}
            seasonIndex={seasonIndex}
            loadedExtras={!isLoadingExtraData}
            roleDiff={storage.roleDiff}
          />

          {/* AI Insight - Separate component for better organization */}
          <AIInsight 
            season={teamData.seasons[seasonIndex]} 
            isLoading={isLoadingExtraData}
          />

          {/* Team Charts */}
          <TeamCharts 
            season={teamData.seasons[seasonIndex]} 
            loadedExtras={!isLoadingExtraData} 
          />

          {/* Matches */}
          <Matches 
            season={teamData.seasons[seasonIndex]} 
            teamNumber={teamNumber} 
          />
        </div>
      </div>
      <Analytics/>
      <SpeedInsights/>
    </div>
  );
}
