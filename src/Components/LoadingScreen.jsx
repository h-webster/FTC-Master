import React from 'react';
import '../App.css';

const LoadingScreen = () => (
  <div className="loading-screen">
    <div className="loading-spinner"></div>
    <h2 className='loading-title'>Loading...</h2>
    <h3 className="loading-info">Loading times aren't ideal yet. Thanks for your patience!</h3>
  </div>
);

export default LoadingScreen; 