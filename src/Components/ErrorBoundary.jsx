import React from 'react';
import './ErrorBoundary.css';

export const ErrorDisplay = ({ error, onRetry, onDismiss }) => {
  return (
    <div className="error-display">
      <div className="error-content">
        <h2 className="error-title">⚠️ Something went wrong</h2>
        <p className="error-message">{error}</p>
        <div className="error-actions">
          {onRetry && (
            <button className="error-retry-btn" onClick={onRetry}>
              Try Again
            </button>
          )}
          {onDismiss && (
            <button className="error-dismiss-btn" onClick={onDismiss}>
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const ErrorBoundary = ({ children, fallback }) => {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const handleError = (event) => {
      setHasError(true);
      setError(event.error?.message || 'An unexpected error occurred');
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return fallback || <ErrorDisplay error={error} onRetry={() => setHasError(false)} />;
  }

  return children;
};
