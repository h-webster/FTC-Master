import { useState } from 'react';

export const SimpleStatTooltip = ({ children, tooltipText, position = 'top' }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div 
      className="simple-stat-container"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      {showTooltip && (
        <div 
          className={`tooltip tooltip-${position}`}
          dangerouslySetInnerHTML={{ __html: tooltipText }}
        />
      )}
    </div>
  );
};
