import React from 'react';
import './LoadingScreenClean.css';

export const LoadingScreenClean = ({ 
  isLoadingTeamData = false, 
  isLoadingExtraData = false, 
  progress = 0,
  error = null,
  onRetry = null 
}) => {
  if (error) {
    return (
      <div className="loading-screen">
        <div className="error-content">
          <h2 className="error-title">⚠️ Something went wrong</h2>
          <p className="error-message">{error}</p>
          {onRetry && (
            <button className="error-retry-btn" onClick={onRetry}>
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  const getLoadingMessage = () => {
    if (isLoadingTeamData) return "Loading team data...";
    if (isLoadingExtraData) return "Analyzing team performance...";
    return "Loading...";
  };

  const getSubMessage = () => {
    if (isLoadingTeamData) return "Fetching match history and statistics";
    if (isLoadingExtraData) return "Generating AI insights and calculating advanced metrics";
    return "Please wait while we gather the data";
  };

  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <h2 className="loading-title">{getLoadingMessage()}</h2>
        <p className="loading-subtitle">{getSubMessage()}</p>
        
        {progress > 0 && (
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="progress-text">{progress}%</span>
          </div>
        )}
        
        <div className="loading-tips">
          <p>💡 <strong>Tip:</strong> Loading times depend on the amount of match data available</p>
          <p>🔄 <strong>Note:</strong> AI analysis may take a moment for teams with extensive match history</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreenClean;
