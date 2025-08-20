export const Matches = ({season, teamNumber}) => {
    if (season.events == null) {
        return null;
    }
    return (
        <div className="matches-table">
            {/*<h2>Matches</h2>*/}
            {season.events.map((e, idx) => (
                <div className='event' key={idx}>
                    <h3>{e.name}</h3>
                    <table>
                    <thead>
                        <tr>
                        <th>Match</th>
                        <th>Score</th>
                        <th>Red</th>
                        <th>Blue</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr key="Quals"><td colSpan={4} className='fullRow'>Quals</td></tr>
                        {e.quals.map((q, jdx) => (
                            <Match m={q} idx={idx} jdx={jdx} teamNumber={teamNumber} key={`quals-${idx}-${jdx}`} />
                        ))}
                        {e.playoffs.length > 0 && (
                            <>
                                <tr key="Playoffs"><td colSpan={4} className='fullRow'>Playoffs</td></tr>
                                {e.playoffs.map((p, jdx) => (
                                    <Match m={p} idx={idx} jdx={jdx} teamNumber={teamNumber} key={`playoffs-${idx}-${jdx}`}/>
                                ))}
                            </> 
                        )}    
                    </tbody>
                    </table>
                </div>
            ))}
      </div>
    );
};

const Match = ({m, idx, jdx, teamNumber}) => {
    return (
        <tr className="matchRow">
            <td>{m.match}</td>
            <td>
                <span className='redScore'>{m.redScore}</span>-<span className='blueScore'>{m.blueScore}</span>
                { (m.alliance == "Red" && m.redScore > m.blueScore) || (m.alliance == "Blue" && m.blueScore > m.redScore) ? (
                <span className='winnerIndicator winIndicator'>👑 Win</span>
                ) : (m.redScore == m.blueScore) ? (
                <span className='winnerIndicator tieIndicator'>😬 Tie</span>
                ) : (
                <span className='winnerIndicator lossIndicator'>❌ Lose</span>
                )}
            </td>
            <td className='redTeam'>
                <div className='teamShow'>
                    {m.redTeams.map((team, index) => {
                        const isCurrentTeam = team.number == teamNumber;
                        const fontWeight = isCurrentTeam ? 'bold' : 'normal';
                        
                        return (
                            <div key={index} className="team">
                                <p className="teamNumber" style={{ fontWeight }}>
                                    {team.number}
                                </p>
                                <p className="teamName" style={{ fontWeight }}>
                                    {team.name}
                                </p>
                            </div>
                        );            
                    })}
                </div>
            </td>
            <td className='blueTeam'>
                <div className='teamShow'>
                    {m.blueTeams.map((team, index) => {
                        const isCurrentTeam = team.number == teamNumber;
                        const fontWeight = isCurrentTeam ? 'bold' : 'normal';
                        
                        return (
                            <div key={index} className="team">
                                <p className="teamNumber" style={{ fontWeight }}>
                                    {team.number}
                                </p>
                                <p className="teamName" style={{ fontWeight }}>
                                    {team.name}
                                </p>
                            </div>
                        );            
                    })}
                </div>
            </td>
            </tr>
    );

};