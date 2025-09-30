import storage from '../utils/storage';
import { SimpleStatTooltip } from './SimpleStatTooltip';
import './TeamStats.css';

export const TeamStats = ({ mockData, seasonIndex, loadedExtras, roleDiff }) => {
  const season = mockData.seasons[seasonIndex];

  return (
    <div className="simple-stats">
      <SimpleStatTooltip 
        tooltipText={`Accuracy Estimations: ${season.rolePrediction.percentSamples}% Samples, ${season.rolePrediction.percentSpecimens}% Specimens. <br>This is a prediction and may not be their true role.`}
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
          { season.events.length == 0 ? (
            <h3 className='simple-stat-value hasTooltip'>Matchup Advantage: No data</h3>
          ) : (loadedExtras) ? (
            <h3 className='simple-stat-value hasTooltip'>Matchup Advantage: {(season.luckScore)}</h3>
          ) : (
            <h3 className='simple-stat-value hasTooltip'>Matchup Advantage: Loading...</h3>
          )}
        </div>
      </SimpleStatTooltip>
      
      { season.sponsors && season.sponsors.length > 0 && (
        <h3 className='simple-stat-value'>Sponsors: {season.sponsors.map((s, i) => (
          <span key={i} className="sponsor" style={{ fontSize: season.sponsors.length > 7 ? '12px' : '1.1em' }}>
            {s}{i === season.sponsors.length - 1 ? '' : ', '}
          </span>
        ))}
        </h3>
      )}

      <h3 className='simple-stat-value'>Location: {season.location}</h3>
      <h3 className='simple-stat-value'>Rookie Year: {season.rookieYear}</h3>
      <h3 className='simple-stat-value'>Average Points: {season.avgPoints}</h3>
    </div>
  );
};
