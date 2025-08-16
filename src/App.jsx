import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './App.css';
import { extractTeamData, extractExtraData } from './DataExtraction';
import LoadingScreen from './LoadingScreen';
import { api } from './api';
import { getTeamData, getExtraData, Query } from './Query';
import { Matches } from './Matches';

const VERSION = 8;


// Tooltip component for simple stats
const SimpleStatTooltip = ({ children, tooltipText, position = 'top' }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div 
      className="simple-stat-container"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      {showTooltip && (
        <div 
          className={`tooltip tooltip-${position}`}
          dangerouslySetInnerHTML={{ __html: tooltipText }}
        />
      )}
    </div>
  );
};

const initialMockData = {
  name: "unknown",
  seasons: [
    {
      year: '2024',
      win: 18,
      loss: 7,
      ties: 2,
      avgPoints: 120,
      autoSuccess: 0.75,
      rolePrediction: {
        percentSamples: 65,
        percentSpecimens: 35
      },
      events: [
        {
          name: "Last Chance",
          matches: [
            { match: 1, points: 110, auto: true },
            { match: 2, points: 130, auto: false },
            { match: 3, points: 120, auto: true },
            // ... more matches
          ],
          luckScore: -999,
        }
      ]
      
    },
  ],
};

const COLORS = ['#4caf50', '#f44336', '#ffeb3b'];

function App() {
  const [mockData, setMockData] = useState(initialMockData);
  const [seasonIndex, setSeasonIndex] = useState(0);
  const [teamNumber, setTeamNumber] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // <-- Add loading state
  const [loadedExtras, setLoadingExtras] = useState(true);
  const season = mockData.seasons[seasonIndex];
  const [roleDiff, setRoleDiff] = useState(0);
  const [getSavedTeam, setSavedTeam] = useState(null);

  const winLossData = [
    { name: 'Wins', value: season.win },
    { name: 'Losses', value: season.loss },
    { name: 'Ties', value: season.ties },
  ];

  useEffect(() => {
    if (submitted) {
      async function fetchData() {
        // First, try to get data from MongoDB
        let savedTeam = await api.getTeam(teamNumber);
        setSavedTeam(savedTeam);
        if (savedTeam && savedTeam.version == VERSION) {
          // Use saved data from MongoDB
          console.log("Found saved team data");
          console.log(savedTeam);
          setMockData(savedTeam);
          setLoading(false);
          setLoadingExtras(false);
        } else if (savedTeam && savedTeam.version != VERSION) {
          // Fetch fresh data from FTC API and save to MongoDB
          const data = await getTeamData(teamNumber);
          console.log("Got API data");
          const teamDataResult = extractTeamData(data, mockData);
          setMockData(teamDataResult);
          setLoading(false);

          try {
            const newDataToUpdate = {
              ...teamDataResult,
              number: teamNumber,
              version: VERSION
            };
            await api.updateTeam(teamNumber, newDataToUpdate);
            console.log("Reupdated team data in MongoDB");
          } catch (error) {
            console.error("Failed to update MongoDB:", error);
          }


        } else {
          // Fetch fresh data from FTC API and save to MongoDB
          const data = await getTeamData(teamNumber);
          console.log("Got API data");
          const teamDataResult = extractTeamData(data, mockData);
          setMockData(teamDataResult);
          setLoading(false);
          
          // Save to MongoDB
          try {
            const teamDataToSave = {
              ...teamDataResult,
              number: teamNumber,
              version: VERSION
            };
            await api.saveTeam(teamDataToSave);
            console.log("Saved team data to MongoDB");
          } catch (error) {
            console.error("Failed to save to MongoDB:", error);
          }
        }
      }
      fetchData();
    }
  }, [submitted, teamNumber]);

  useEffect(() => {
    if (submitted && !loading) {
      async function fetchExtraData() {
        if (getSavedTeam) {
          if (getSavedTeam.seasons[seasonIndex].luckScore != -999 && getSavedTeam.version == VERSION) {
            setLoadingExtras(false);
            console.log("Already have extra data");
            return;
          }
        }
        const extraData = await getExtraData(teamNumber); 
        const extraDataResult = extractExtraData(extraData, mockData);
        console.log(extraDataResult);
        setMockData(extraDataResult);
        setLoadingExtras(false);
        
        // Update MongoDB with extra data
        try {
          const extraDataToUpdate = {
            ...extraDataResult,
            number: teamNumber
          };
          await api.updateTeam(teamNumber, extraDataToUpdate);
          console.log("Updated team data with extra info in MongoDB");
        } catch (error) {
          console.error("Failed to update MongoDB:", error);
        }
      }
      fetchExtraData();
    }
  }, [loading]);

  // Separate useEffect to calculate roleDiff when mockData changes
  useEffect(() => {
    if (mockData.seasons[seasonIndex]?.rolePrediction) {
      const currentSeason = mockData.seasons[seasonIndex];
      console.log(mockData.matches);
      setRoleDiff(currentSeason.rolePrediction.percentSamples - currentSeason.rolePrediction.percentSpecimens);
    }
  }, [mockData, seasonIndex]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!teamNumber.trim() || isNaN(Number(teamNumber))) {
      setError('Please enter a valid team number.');
      return;
    }
    const isValid = await isValidTeamNumber(teamNumber);
    if (!isValid) {
      setError('Please enter a valid team number.');
      return;
    }
    setError('');
    setLoading(true); // <-- Start loading
    setLoadingExtras(true);
    setSubmitted(true);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!submitted) {
    return (
      <div className="team-entry-screen">
        <form className="team-entry-form" onSubmit={handleSubmit}>
          <h1>FTC Team Performance Visualizer</h1>
          <label htmlFor="team-number">Enter Team Number:</label>
          <input
            id="team-number"
            type="text"
            value={teamNumber}
            onChange={e => {
              setTeamNumber(e.target.value);
            }}
            placeholder="e.g. 12345"
            autoFocus
          />
          <button type="submit">Analyze</button>
          {error && <div className="error-message">{error}</div>}
        </form>
      </div>
    );
  }

  return (
    <div className="ftc-dashboard">
      <header>
        <div className="team-title">
          <h1>Team {teamNumber} Performance</h1>
          <h2 className="team-name">{mockData.name}</h2>
        </div>
      </header>
      <div className="simple-stats">
        <SimpleStatTooltip 
          tooltipText={`Accuracy Estimations: ${mockData.seasons[seasonIndex].rolePrediction.percentSamples}% Samples, ${mockData.seasons[seasonIndex].rolePrediction.percentSpecimens}% Specimens`}
          position="top"
        >
          <div className="simple-stat role-prediction">
            { Math.abs(roleDiff) < 1 ? (
              <h3 className="simple-stat-value hasTooltip">Predicted Role: Hybrid</h3>
            ) : roleDiff < 1 ? (
              <h3 className="simple-stat-value hasTooltip">Predicted Role: Specimen</h3>
            ) : (
              <h3 className="simple-stat-value hasTooltip">Predicted Role: Sample</h3>
            )}
          </div>
        </SimpleStatTooltip>
        <SimpleStatTooltip
          tooltipText={"Higher score means recieved better matchups in quals (based off OPR)"}
          position='top'
        >
          <div className='simple-stat'>
            { !loadedExtras || mockData.seasons[seasonIndex].luckScore != -999 ? (
              <h3 className='simple-stat-value hasTooltip'>Matchup Advantage: {(mockData.seasons[seasonIndex].luckScore)}</h3>
            ) : (
              <h3 className='simple-stat-value hasTooltip'>Matchup Advantage: Loading...</h3>
            )}
          </div>
        </SimpleStatTooltip>
        <h3 className='simple-stat-value'>Average Points: {season.avgPoints}</h3>
      </div>
      <div className="charts-container">
        <div className="chart-card">
          <h2>Win/Loss Ratio</h2>
          { season.win == 0 && season.loss == 0 ? (
            <div className="full-lossrate">
              <div>No wins or losses</div>
            </div>
          ) : (
            <div className="win-loss-ratio">
            <PieChart width={200} height={200}>
              <Pie
                data={winLossData}
                cx={100}
                cy={100}
                innerRadius={50}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {winLossData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
              <div>Wins: {season.win}, Losses: {season.loss}, Ties: {season.ties}</div>
            </div>
          )}
        </div>
      </div>
      <Matches season={season} teamNumber={teamNumber}/>
    </div>
  );
} 

async function isValidTeamNumber(teamNumber) {
  const query = `
  {
    teamByNumber(number: ${Number(teamNumber)}) {
      name
    }
  }
  `;
  const teamNumberQuery = await Query(query);
  return teamNumberQuery.data.teamByNumber !== null;
}

export default App;
