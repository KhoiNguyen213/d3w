import React from 'react';
import './LoadingOverlay.css';

const LoadingOverlay = ({ isLoading }) => {
  if (!isLoading) return null;
  return (
    <div className="loading-overlay">
      <div className="spinner" />
    </div>
  );
};

export default LoadingOverlay;
