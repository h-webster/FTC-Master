import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../api';
import { getExtraData } from '../Query';
import { extractExtraData } from '../DataExtraction';
import { VERSION } from '../utils/constants';
import { collectTeamData } from '../CollectTeamData';

// Centralized loading states
const LOADING_STATES = {
  IDLE: 'idle',
  INITIALIZING: 'initializing',
  FETCHING_TEAM_DATA: 'fetching_team_data',
  TEAM_DATA_COMPLETED: 'team_data_completed',
  FETCHING_EXTRA_DATA: 'fetching_extra_data',
  COMPLETED: 'completed',
  ERROR: 'error'
};

export const useTeamDataManager = (teamNumber, submitted, teamMap = {}) => {
  // Core state
  const [teamData, setTeamData] = useState({
    name: "unknown",
    seasons: [{
      year: '2024',
      win: 0,
      loss: 0,
      ties: 0,
      avgPoints: 0,
      rolePrediction: { percentSamples: 65, percentSpecimens: 35 },
      events: []
    }],
  });
  
  const [loadingState, setLoadingState] = useState(LOADING_STATES.IDLE);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  
  // Refs to prevent stale closures
  const teamDataRef = useRef(teamData);
  const loadingStateRef = useRef(loadingState);
  
  // Update refs when state changes
  teamDataRef.current = teamData;
  loadingStateRef.current = loadingState;

  // Progress tracking
  const updateProgress = useCallback((newProgress) => {
    setProgress(newProgress);
  }, []);

  // Error handling
  const handleError = useCallback((errorMessage, originalError = null) => {
    console.error('TeamDataManager Error:', errorMessage, originalError);
    setError(errorMessage);
    setLoadingState(LOADING_STATES.ERROR);
    setProgress(0);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Reset all states
  const reset = useCallback(() => {
    setLoadingState(LOADING_STATES.IDLE);
    setError(null);
    setProgress(0);
    setTeamData(prev => ({
      ...prev,
      aiInsight: undefined,
      luckScore: undefined
    }));
  }, []);

  // Fetch team data
  const fetchTeamData = useCallback(async () => {
    try {
      setLoadingState(LOADING_STATES.FETCHING_TEAM_DATA);
      updateProgress(25);
      
      const result = await collectTeamData(teamNumber, teamDataRef.current, teamMap);
      setTeamData(result);
      updateProgress(50);
      
      return result;
    } catch (error) {
      handleError(`Failed to fetch team data: ${error.message}`, error);
      throw error;
    }
  }, [teamNumber, teamMap, updateProgress, handleError]);

  // Fetch extra data (AI insights, luck score)
  const fetchExtraData = useCallback(async (currentTeamData) => {
    try {
      // Check if we need extra data
      if (!currentTeamData.seasons[0].events.length) {
        updateProgress(100);
        setLoadingState(LOADING_STATES.COMPLETED);
        return;
      }

      setLoadingState(LOADING_STATES.FETCHING_EXTRA_DATA);
      updateProgress(75);

      // Clear any existing AI data
      setTeamData(prev => ({
        ...prev,
        aiInsight: undefined,
        luckScore: undefined
      }));

      const extraRaw = await getExtraData(teamNumber);
      const extraResult = await extractExtraData(extraRaw, currentTeamData);
      
      setTeamData(extraResult);
      updateProgress(100);
      setLoadingState(LOADING_STATES.COMPLETED);

      // Save to database
      await api.updateTeam(teamNumber, { ...extraResult, number: teamNumber });
      
    } catch (error) {
      handleError(`Failed to fetch extra data: ${error.message}`, error);
    }
  }, [teamNumber, updateProgress, handleError]);

  // Load team data (basic info first)
  const loadTeamData = useCallback(async () => {
    try {
      reset();
      setLoadingState(LOADING_STATES.INITIALIZING);
      updateProgress(10);

      // Try to get cached data first
      const savedTeamData = await api.getTeam(teamNumber);
      
      if (savedTeamData && savedTeamData.version === VERSION) {
        // Use cached data
        setTeamData(savedTeamData);
        setLoadingState(LOADING_STATES.TEAM_DATA_COMPLETED);
        updateProgress(100);
        
        // Start loading extra data in background
        const needsExtraData = savedTeamData.seasons[0].events.length > 0 && 
                              (savedTeamData.seasons[0].luckScore === -999 || 
                               savedTeamData.seasons[0].aiInsight === undefined);
        
        if (needsExtraData) {
          // Load extra data in background (don't await)
          fetchExtraData(savedTeamData);
        }
      } else {
        // Fetch fresh data
        const freshData = await fetchTeamData();
        
        // Save to database
        const payload = { ...freshData, number: teamNumber, version: VERSION };
        try {
          if (savedTeamData) {
            await api.updateTeam(teamNumber, payload);
          } else {
            await api.saveTeam(payload);
          }
        } catch (saveError) {
          console.warn('Failed to save team data:', saveError);
          // Don't fail the entire process if save fails
        }

        // Mark team data as completed
        setLoadingState(LOADING_STATES.TEAM_DATA_COMPLETED);
        updateProgress(100);
        
        // Start loading extra data in background (don't await)
        fetchExtraData(freshData);
      }
      
    } catch (error) {
      handleError(`Failed to load team data: ${error.message}`, error);
    }
  }, [teamNumber, fetchTeamData, fetchExtraData, reset, updateProgress, handleError]);

  // Retry function
  const retry = useCallback(() => {
    clearError();
    loadTeamData();
  }, [clearError, loadTeamData]);

  // Main effect - only runs when team number or submission status changes
  useEffect(() => {
    if (!submitted || !teamMap || Object.keys(teamMap).length === 0) {
      return;
    }

    loadTeamData();
  }, [submitted, teamNumber, loadTeamData]);

  // Computed properties
  const isLoading = loadingState === LOADING_STATES.INITIALIZING || 
                   loadingState === LOADING_STATES.FETCHING_TEAM_DATA;
  const isLoadingTeamData = loadingState === LOADING_STATES.FETCHING_TEAM_DATA;
  const isLoadingExtraData = loadingState === LOADING_STATES.FETCHING_EXTRA_DATA;
  const hasError = loadingState === LOADING_STATES.ERROR;
  const isCompleted = loadingState === LOADING_STATES.COMPLETED;
  const isTeamDataReady = loadingState === LOADING_STATES.TEAM_DATA_COMPLETED || 
                         loadingState === LOADING_STATES.FETCHING_EXTRA_DATA || 
                         loadingState === LOADING_STATES.COMPLETED;

  return {
    // Data
    teamData,
    setTeamData,
    
    // Loading states
    loadingState,
    isLoading,
    isLoadingTeamData,
    isLoadingExtraData,
    isCompleted,
    isTeamDataReady,
    
    // Error handling
    hasError,
    error,
    
    // Progress
    progress,
    
    // Actions
    retry,
    reset
  };
};
