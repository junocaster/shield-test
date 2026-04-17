import React from 'react';

export default function InstructionsPage({ onStart }) {
  return (
    <div className="page instructions-page">
      <div className="instructions-card">
        <h2 className="instructions-title">How It Works</h2>

        <p className="instructions-lead">
          You will be shown <strong>20 SMS messages</strong> one at a time.
          For each message, complete the fill-in-the-blank sentence below it by
          selecting the best option from each dropdown.
        </p>

        <div className="instructions-types">
          <div className="type-pill type-phishing">
            <span className="type-dot" />
            <div>
              <strong>Phishing</strong>
              <p>Fraudulent message designed to steal personal information or credentials.</p>
            </div>
          </div>
          <div className="type-pill type-spam">
            <span className="type-dot" />
            <div>
              <strong>Spam</strong>
              <p>Unsolicited bulk message — unwanted but not necessarily malicious.</p>
            </div>
          </div>
          <div className="type-pill type-harmless">
            <span className="type-dot" />
            <div>
              <strong>Harmless</strong>
              <p>Legitimate message from a trusted sender with no suspicious elements.</p>
            </div>
          </div>
        </div>

        <div className="instructions-tips">
          <h3>Tips</h3>
          <ul>
            <li>Read the full message carefully before answering.</li>
            <li>Pay attention to the sender name, URL, and tone of the message.</li>
            <li>Select an answer for <em>every</em> dropdown before confirming.</li>
            <li>You cannot go back once you confirm an answer.</li>
          </ul>
        </div>

        <button className="btn btn-primary btn-lg" onClick={onStart}>
          START
        </button>
      </div>
    </div>
  );
}
