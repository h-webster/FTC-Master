import { PieChart, Pie, Cell } from 'recharts';
import { PointsGraph } from './LineGraph';
import { Ordinalize } from '../Fancy';
import './TeamCharts.css';
import storage from '../utils/storage';
import { openAPI } from '../hooks/useAi';
import insight from '../assets/insight.png';

const COLORS = ['#4caf50', '#f44336', '#ffeb3b'];

export const TeamCharts = ({ season }) => {
  const winLossData = [
    { name: 'Wins', value: season.win },
    { name: 'Losses', value: season.loss },
    { name: 'Ties', value: season.ties },
  ];
  if (season.win + season.loss + season.ties == 0) {
    return (
      <div>Did not play</div>
    )
  }

  const totalTeams = season.quickStats.count;
  
  const { strength, weakness, score } = season.aiInsight ? openAPI.formatAI(season.aiInsight) : { strength: '', weakness: '', score: 0 };
  console.log("Ai insight length: " + (season.aiInsight?.length || 'undefined'));
  return (
    <div className="charts-container">
      <div className='chart-card'>
        <div class='ai-title'>
          <h2>AI Insight</h2>
          <img src={insight} alt="Insight Icon" className="insight-icon" width={30} height={30}/>
        </div>
        <div className='ai-insight ai-chart'>
          { !storage.loadedExtras ? (
            season.aiInsight ? (
              <div className='inner-insight'>
                <h3 className='ai-score' style={{color: `hsl(${score * 12}, 70%, 45%)`}}>Score: {score}/10</h3>
                <h3 className='strength-title'>Strengths:</h3>
                <p className='strengths' dangerouslySetInnerHTML={{__html: strength}}/>
                <h3 className='weakness-title'>Weaknesses:</h3>
                <p className='weaknesses' dangerouslySetInnerHTML={{__html: weakness}}/>
              </div>
            ) : (
              <p>No insights available.</p>            
            )
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
      <div className='chart-card'>
        <h2>Best OPR Stats</h2>
        <div className='quick-stats'>
          <div className="quick-stat">
            <h3 className='quick-stat-title'>Total NP: {season.quickStats.tot.value.toFixed(2)}</h3>
            <p className='quick-stat-desc'>{Ordinalize(season.quickStats.tot.rank)} / {totalTeams}</p>
          </div>
          <div className="quick-stat">
            <h3 className='quick-stat-title'>Auto: {season.quickStats.auto.value.toFixed(2)}</h3>
            <p className='quick-stat-desc'>{Ordinalize(season.quickStats.auto.rank)} / {totalTeams}</p>
          </div>
          <div className="quick-stat">
            <h3 className='quick-stat-title'>Teleop: {season.quickStats.dc.value.toFixed(2)}</h3>
            <p className='quick-stat-desc'>{Ordinalize(season.quickStats.dc.rank)} / {totalTeams}</p>
          </div>
          <div className="quick-stat">
            <h3 className='quick-stat-title'>Endgame: {season.quickStats.eg.value.toFixed(2)}</h3>
            <p className='quick-stat-desc'>{Ordinalize(season.quickStats.eg.rank)} / {totalTeams}</p>
          </div>
        </div>
      </div>
      
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
      
      <PointsGraph data={season.points}/>
    </div>
  );
};