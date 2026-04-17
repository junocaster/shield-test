// src/components/EndPage.js
import React from 'react';
import shieldLogo from '../assets/SHIELD_Logo.png';

export default function EndPage({ onExit }) { // Add onExit prop
  return (
    <div className="page end-page">
      <div className="end-card">
        <img src={shieldLogo} alt="SHIELD" className="shield-logo shield-logo--sm" />
        <h2 className="end-title">THANK YOU!</h2>
        <p className="end-message">
          Thank you for participating! The data you provided is invaluable to the success of our thesis.
          We appreciate the time you took to help us refine our model.
        </p>
        <p className="end-note">
          Dev Note: You may take a screenshot of this page and send it to a developer on our team.
          This helps us track participation and eases our worries about our thesis! ;)
        </p>
        
        <button 
          className="btn btn-outline btn-lg" 
          onClick={onExit}
        >
          EXIT
        </button>
      </div>
    </div>
  );
}