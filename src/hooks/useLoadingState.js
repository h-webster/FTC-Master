import { useState, useCallback } from 'react';

// Clean loading state management
export const useLoadingState = () => {
  const [loadingState, setLoadingState] = useState({
    isInitializing: true,
    isFetchingTeamData: false,
    isFetchingExtraData: false,
    error: null,
    progress: 0
  });

  const updateLoadingState = useCallback((updates) => {
    setLoadingState(prev => ({ ...prev, ...updates }));
  }, []);

  const setError = useCallback((error) => {
    setLoadingState(prev => ({ 
      ...prev, 
      error,
      isInitializing: false,
      isFetchingTeamData: false,
      isFetchingExtraData: false
    }));
  }, []);

  const startTeamDataFetch = useCallback(() => {
    setLoadingState(prev => ({
      ...prev,
      isInitializing: false,
      isFetchingTeamData: true,
      isFetchingExtraData: false,
      error: null,
      progress: 25
    }));
  }, []);

  const completeTeamDataFetch = useCallback(() => {
    setLoadingState(prev => ({
      ...prev,
      isFetchingTeamData: false,
      progress: 50
    }));
  }, []);

  const startExtraDataFetch = useCallback(() => {
    setLoadingState(prev => ({
      ...prev,
      isFetchingExtraData: true,
      progress: 75
    }));
  }, []);

  const completeExtraDataFetch = useCallback(() => {
    setLoadingState(prev => ({
      ...prev,
      isFetchingExtraData: false,
      progress: 100
    }));
  }, []);

  const reset = useCallback(() => {
    setLoadingState({
      isInitializing: true,
      isFetchingTeamData: false,
      isFetchingExtraData: false,
      error: null,
      progress: 0
    });
  }, []);

  // Computed properties for easier use
  const isLoading = loadingState.isInitializing || 
                   loadingState.isFetchingTeamData || 
                   loadingState.isFetchingExtraData;

  const isLoadingTeamData = loadingState.isFetchingTeamData;
  const isLoadingExtraData = loadingState.isFetchingExtraData;
  const hasError = !!loadingState.error;

  return {
    // State
    loadingState,
    isLoading,
    isLoadingTeamData,
    isLoadingExtraData,
    hasError,
    error: loadingState.error,
    progress: loadingState.progress,
    
    // Actions
    updateLoadingState,
    setError,
    startTeamDataFetch,
    completeTeamDataFetch,
    startExtraDataFetch,
    completeExtraDataFetch,
    reset
  };
};
