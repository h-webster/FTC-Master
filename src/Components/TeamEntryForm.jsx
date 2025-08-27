import { useState } from 'react';
import { runSearch } from '../TeamSearch';
import './TeamEntryForm.css';
import { massTeamExtraction } from '../utils/massTeamExtract';

export const TeamEntryForm = ({ onSubmit, error, mockData }) => {
  const [teamNumber, setTeamNumber] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (teamNumber.trim()) {
      onSubmit(teamNumber);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setTeamNumber(value);
    if (value.trim()) {
      const results = runSearch(value);
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleResultClick = (result) => {
    setTeamNumber(result.number.toString());
    setShowSearchResults(false);
  };

  const bulkFetch = async (e) => {
    e.preventDefault();
    console.log("Starting Bulk Fetch");
    await massTeamExtraction(mockData);
  };

  return (
    <div className="team-entry-screen">
      <form className="team-entry-form" onSubmit={handleSubmit}>
        <h1>FTC-Master <span className="beta">[Beta]</span></h1>
        <label htmlFor="team-number">Enter Team Number/Name:</label>
        <div className="input-container">
          <input
            id="team-number"
            type="text"
            value={teamNumber}
            onChange={handleInputChange}
            autoComplete="off"
            onFocus={() => {
              if (teamNumber.trim() && searchResults.length > 0) {
                setShowSearchResults(true);
              }
            }}
            onBlur={() => {
              // Delay hiding results to allow clicking on them
              setTimeout(() => setShowSearchResults(false), 200);
            }}
            placeholder="e.g. 12345"
            autoFocus
          />
          {showSearchResults && (
            <div className="search-results">
              {searchResults.length > 0 ? (
                searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="search-result-item"
                    onClick={() => handleResultClick(result)}
                  >
                    <span className="team-number">{result.number}</span>
                    <span className="team-name">{result.name}</span>
                  </div>
                ))
              ) : (
                <div className="search-result-item no-results">
                  <span>No teams found</span>
                </div>
              )}
            </div>
          )}
        </div>
        <button type="submit">Analyze</button>
        {error && <div className="error-message">{error}</div>}
      </form>
      { process.env.NODE_ENV != 'production' && (
        <form onSubmit={bulkFetch}>
          <button type="submit">Bulk Fetch</button>
        </form>
      )}
    </div>
  );
};
