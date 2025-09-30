import React from 'react';
import { openAPI } from '../hooks/useAi';
import insight from '../assets/insight.png';
import './AIInsight.css';

export const AIInsight = ({ season, isLoading }) => {
  // Parse AI insight data
  const parseAIInsight = (aiText) => {
    if (!aiText) return { strength: '', weakness: '', score: 0 };
    return openAPI.formatAI(aiText);
  };

  const { strength, weakness, score } = parseAIInsight(season?.aiInsight);

  // Determine score color
  const getScoreColor = (score) => {
    const numScore = parseFloat(score) || 0;
    if (numScore >= 8) return '#4caf50'; // Green
    if (numScore >= 6) return '#ff9800'; // Orange
    return '#f44336'; // Red
  };

  return (
    <div className="ai-insight-card">
      <div className="ai-insight-header">
        <h2>AI Insight</h2>
        <img src={insight} alt="Insight Icon" className="insight-icon" width={30} height={30}/>
      </div>
      
      <div className="ai-insight-content">
        {isLoading ? (
          <div className="ai-loading">
            <div className="ai-spinner"></div>
            <p>Generating AI insights...</p>
            <small>This may take a moment while we analyze the team's performance</small>
          </div>
        ) : season?.aiInsight ? (
          <div className="ai-insight-data">
            <div className="ai-score-section">
              <h3 
                className="ai-score" 
                style={{ color: getScoreColor(score) }}
              >
                Score: {score}/10
              </h3>
            </div>
            
            <div className="ai-analysis-section">
              <div className="strength-section">
                <h3 className="section-title">Strengths</h3>
                <div 
                  className="section-content strengths" 
                  dangerouslySetInnerHTML={{ __html: strength }}
                />
              </div>
              
              <div className="weakness-section">
                <h3 className="section-title">Areas for Improvement</h3>
                <div 
                  className="section-content weaknesses" 
                  dangerouslySetInnerHTML={{ __html: weakness }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="ai-no-data">
            <p>No AI insights available for this team.</p>
            <small>AI analysis requires match data to generate insights.</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsight;
