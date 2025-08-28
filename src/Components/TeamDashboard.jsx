import { TeamStats } from './TeamStats';
import { TeamCharts } from './TeamCharts';
import { Matches } from './Matches';
import './TeamDashboard.css';

export const TeamDashboard = ({ teamNumber, mockData, seasonIndex, loadedExtras, roleDiff }) => {
  const goHome = () => {
    window.location.reload();
  };

  return (
    <div className='team-dashboard'>
      <div className='header2'>
        <div className='display'>
          <img className='big-img' src="/logo.png"></img>
          <p className='big-text'>FTCMaster</p>
          <button className='home-btn' onClick={goHome}>Home</button>
        </div>
      </div>
      <div className="ftc-dashboard">
        <header>
          <div className="team-title">
            <h1>Team {teamNumber} Performance</h1>
            <h2 className="team-name">{mockData.name}</h2>
          </div>
        </header>
        
        <TeamStats 
          mockData={mockData}
          seasonIndex={seasonIndex}
          loadedExtras={loadedExtras}
          roleDiff={roleDiff}
        />
        
        <TeamCharts season={mockData.seasons[seasonIndex]} />
        
        <Matches season={mockData.seasons[seasonIndex]} teamNumber={teamNumber} />
      </div>
    </div>
    
  );
};
