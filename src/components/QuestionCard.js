import React, { useState, useRef, useEffect } from 'react';
import ProgressBar from './ProgressBar';

/**
 * Normalise a display label to snake_case so it can be matched
 * against the DB's red_flags_present / safe_indicators_present arrays.
 *
 * Examples:
 *   "Suspicious URL"  → "suspicious_url"
 *   "Impersonation"   → "impersonation"
 *   "Too Good To Be True" → "too_good_to_be_true"
 */
function toSnake(str) {
  return (str || '').toLowerCase().replace(/\s+/g, '_');
}

/**
 * Compute accuracy metrics from the user's dropdown answers.
 *
 * Since every slot must be filled before CONFIRM:
 *   num_missed          = 0
 *   num_false_positives = total non-type slots - TP
 *   accuracy_score      = TP / total non-type slots
 *
 * Flag / indicator arrays are cross-referenced via toSnake() so that
 * "Suspicious URL" (dropdown label) matches "suspicious_url" (DB value).
 */
function computeAccuracy(parts, userAnswers, question) {
  const nonTypeSlots  = parts.filter(
    (p) => p.kind === 'dropdown' && p.slot !== 'type'
  );
  const redFlags       = question.red_flags_present       || [];
  const safeIndicators = question.safe_indicators_present || [];

  let tp = 0, fp = 0;
  const userFlagsIdentified      = [];
  const userIndicatorsIdentified = [];
  const redFlagFalsePos          = [];
  const indicatorFalsePos        = [];

  nonTypeSlots.forEach((part) => {
    const userAnswer = userAnswers[part.slot];
    const isCorrect  = userAnswer === part.correct;

    if (isCorrect) {
      tp++;
      const key = toSnake(part.correct);
      if (redFlags.includes(key))            userFlagsIdentified.push(part.correct);
      else if (safeIndicators.includes(key)) userIndicatorsIdentified.push(part.correct);
    } else {
      fp++;
      const key = toSnake(userAnswer);
      if (redFlags.includes(key))            redFlagFalsePos.push(userAnswer);
      else if (safeIndicators.includes(key)) indicatorFalsePos.push(userAnswer);
    }
  });

  const total        = nonTypeSlots.length;
  const accuracyScore = total > 0 ? tp / total : 1.0;

  return {
    numTruePositives: tp,
    numMissed: 0,
    numFalsePositives: fp,
    accuracyScore,
    userFlagsIdentified,
    userIndicatorsIdentified,
    redFlagFalsePos,
    indicatorFalsePos,
  };
}

export default function QuestionCard({
  question,
  sessionId,
  interactionNum,
  totalQuestions,
  onConfirm,
}) {
  const parts = question.question_format?.parts || [];

  const initialAnswers = {};
  parts.forEach((p) => { if (p.kind === 'dropdown') initialAnswers[p.slot] = ''; });

  const [userAnswers, setUserAnswers] = useState(initialAnswers);
  const [confirmed,   setConfirmed]   = useState(false);

  const startedAt = useRef(new Date().toISOString());
  const startMs   = useRef(Date.now());

  useEffect(() => {
    const fresh = {};
    parts.forEach((p) => { if (p.kind === 'dropdown') fresh[p.slot] = ''; });
    setUserAnswers(fresh);
    setConfirmed(false);
    startedAt.current = new Date().toISOString();
    startMs.current   = Date.now();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id]);

  const allFilled = Object.values(userAnswers).every((v) => v !== '');

  function handleSelect(slot, value) {
    if (confirmed) return;
    setUserAnswers((prev) => ({ ...prev, [slot]: value }));
  }

  function handleConfirm() {
    if (!allFilled || confirmed) return;

    const submittedAt      = new Date().toISOString();
    const responseTimeSecs = (Date.now() - startMs.current) / 1000;

    const userTypePrediction = (userAnswers['type'] || '').toLowerCase();
    const typeCorrect        = userTypePrediction === question.true_type;

    const {
      numTruePositives, numMissed, numFalsePositives,
      accuracyScore, userFlagsIdentified, userIndicatorsIdentified,
      redFlagFalsePos, indicatorFalsePos,
    } = computeAccuracy(parts, userAnswers, question);

    const payload = {
      session_id:                 sessionId,
      question_id:                question.id,
      question_number:            question.question_number,
      interaction_num:            interactionNum,
      started_at:                 startedAt.current,
      submitted_at:               submittedAt,
      response_time_seconds:      responseTimeSecs,
      user_type_prediction:       userTypePrediction,
      type_correct:               typeCorrect,
      user_flags_identified:      userFlagsIdentified,
      user_indicators_identified: userIndicatorsIdentified,
      red_flag_false_positives:   redFlagFalsePos,
      safe_indicator_false_pos:   indicatorFalsePos,
      accuracy_score:             accuracyScore,
      num_true_positives:         numTruePositives,
      num_missed:                 numMissed,
      num_false_positives:        numFalsePositives,
    };

    setConfirmed(true);
    onConfirm(payload, userAnswers);
  }

  return (
    <div className="page question-page">
      <div className="question-header">
        <ProgressBar current={interactionNum} total={totalQuestions} />
        <div className="question-meta">
          <span className="question-num">Question {interactionNum}</span>
          <span className={`difficulty-badge diff-${question.difficulty_tier}`}>
            {question.difficulty_tier}
          </span>
        </div>
      </div>

      <div className="question-body">
        <div className="sms-wrapper">
          <div className="sms-header">
            <span className="sms-dot" />
            <span className="sms-sender">SMS Message</span>
          </div>
          <div className="sms-bubble">
            <p className="sms-text">{question.sms_text}</p>
          </div>
        </div>

        <div className="fitb-section">
          <p className="fitb-instruction">Complete the sentence:</p>
          <div className="fitb-sentence">
            {parts.map((part, idx) => {
              if (part.kind === 'text') {
                return <span key={idx} className="fitb-text">{part.content}</span>;
              }
              if (part.kind === 'dropdown') {
                const selected = userAnswers[part.slot];
                return (
                  <select
                    key={idx}
                    className={`fitb-select ${selected ? 'fitb-select--filled' : 'fitb-select--empty'}`}
                    value={selected}
                    onChange={(e) => handleSelect(part.slot, e.target.value)}
                    disabled={confirmed}
                  >
                    <option value="" disabled>▾ select</option>
                    {part.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>

      <div className="question-footer">
        <button
          className={`btn btn-primary btn-lg ${!allFilled ? 'btn-disabled' : ''}`}
          onClick={handleConfirm}
          disabled={!allFilled || confirmed}
        >
          CONFIRM
        </button>
        {!allFilled && (
          <p className="fitb-hint">Fill in all blanks to continue.</p>
        )}
      </div>
    </div>
  );
}