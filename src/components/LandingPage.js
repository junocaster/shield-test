import React from 'react';
import shieldLogo from '../assets/SHIELD_Logo.png';

export default function LandingPage({ onProceed }) {
  return (
    <div className="page landing-page">
      <div className="landing-card">
        <img src={shieldLogo} alt="SHIELD" className="shield-logo" />
        <h1 className="landing-title">SHIELD</h1>
        <p className="landing-intro">
          Welcome! This study collects data on how people identify smishing (SMS
          phishing) messages. Your responses will help train an adaptive learning
          system for cybersecurity awareness. 
        </p>
        <p className="landing-intro">
          Rest assured that all data collected is strictly for academic and thesis purposes. 
          No personal information is required or stored; your input remains completely anonymous 
          as we focus solely on classification patterns. 
        </p>
        <p className="landing-note">
          This activity takes approximately <strong>10–15 minutes</strong>. All
          responses are anonymous.
        </p>
        <button className="btn btn-primary btn-lg" onClick={onProceed}>
          PROCEED
        </button>
      </div>
    </div>
  );
}
