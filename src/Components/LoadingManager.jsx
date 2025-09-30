import React from 'react';
import './LoadingManager.css';

export const LoadingManager = ({ 
  loadingState,
  isLoadingTeamData,
  isLoadingExtraData,
  progress,
  error,
  onRetry,
  children 
}) => {
  // Show error state
  if (error) {
    return (
      <div className="loading-manager">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h2 className="error-title">Something went wrong</h2>
          <p className="error-message">{error}</p>
          <button className="retry-button" onClick={onRetry}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoadingTeamData || isLoadingExtraData) {
    const getLoadingMessage = () => {
      if (isLoadingTeamData) return "Loading team data...";
      if (isLoadingExtraData) return "Generating AI insights...";
      return "Loading...";
    };

    const getSubMessage = () => {
      if (isLoadingTeamData) return "Fetching match history and statistics";
      if (isLoadingExtraData) return "Analyzing performance and calculating advanced metrics";
      return "Please wait";
    };

    return (
      <div className="loading-manager">
        <div className="loading-state">
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
              <span className="progress-text">{Math.round(progress)}%</span>
            </div>
          )}
          
          <div className="loading-tips">
            <p>💡 <strong>Tip:</strong> Loading time depends on match data availability</p>
            <p>🤖 <strong>AI Analysis:</strong> Generating insights based on team performance</p>
          </div>
        </div>
      </div>
    );
  }

  // Show children when loading is complete
  return children;
};

export default LoadingManager;
