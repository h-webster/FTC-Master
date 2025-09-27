import { TeamStats } from './TeamStats';
import { TeamCharts } from './TeamCharts';
import { Matches } from './Matches';
import './TeamDashboard.css';
import storage from '../utils/storage';
import { loadTeamList } from '../loadStorageValues';
import { useState, useEffect } from 'react';
import LoadingScreen from './LoadingScreen';
import { useParams } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { useTeamData } from '../hooks/useTeamData';
import Header from './Header';

export default function TeamDashboard() {
  const { teamNumber } = useParams();
  const [seasonIndex] = useState(0);
  const [ready, setReady] = useState(false);

  // Initialize teamMap and teamList
  useEffect(() => {
    const initData = async () => {
      if (!storage.teamList || !storage.teamMap) {
        await loadTeamList();
      }
      setReady(true);
    };
    initData();
  }, []);

  // Always call useTeamData — pass empty object if storage.teamMap is not ready
  const { teamData, loading, loadedExtras } = useTeamData(teamNumber, true, storage.teamMap || {});

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

  if (!ready || loading) return <LoadingScreen />;


  return (
    <>
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
            loadedExtras={loadedExtras}
            roleDiff={storage.roleDiff}
          />

          <TeamCharts season={teamData.seasons[seasonIndex]} />

          <Matches season={teamData.seasons[seasonIndex]} teamNumber={teamNumber} />
        </div>
      </div>
      <Analytics/>
      <SpeedInsights/>
    </>
  );
}
