import React from 'react';
import ProgressBar from './ProgressBar';

function capitalise(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Render the completed sentence with colour-coded chips.
 * green = correct answer, red = wrong answer (shows the correct value inline).
 */
function ReviewSentence({ parts, responsePayload }) {
  const userTypePrediction = responsePayload.user_type_prediction || '';
  const userAnswers        = responsePayload._userAnswers || {};

  return (
    <div className="fitb-sentence fitb-sentence--review">
      {parts.map((part, idx) => {
        if (part.kind === 'text') {
          return <span key={idx} className="fitb-text">{part.content}</span>;
        }
        if (part.kind === 'dropdown') {
          const userVal  = part.slot === 'type'
            ? capitalise(userTypePrediction)
            : (userAnswers[part.slot] || '—');
          const isCorrect = userVal.toLowerCase() === part.correct.toLowerCase();

          return (
            <span
              key={idx}
              className={`review-chip ${isCorrect ? 'review-chip--correct' : 'review-chip--wrong'}`}
            >
              {userVal}
              {!isCorrect && (
                <span className="review-chip-correct"> ✓ {part.correct}</span>
              )}
            </span>
          );
        }
        return null;
      })}
    </div>
  );
}

export default function ReviewCard({ response, currentIndex, totalQuestions, onNext }) {
  const question = response.question;
  const parts    = question?.question_format?.parts || [];

  const tp    = response.num_true_positives;
  const total = parts.filter((p) => p.kind === 'dropdown' && p.slot !== 'type').length;
  const pct   = Math.round(response.accuracy_score * 100);
  const typeCorrect = response.type_correct;

  return (
    <div className="page review-page">
      <div className="review-header">
        <ProgressBar current={currentIndex + 1} total={totalQuestions} />
        <div className="question-meta">
          <span className="question-num">Question {currentIndex + 1} — Review</span>
        </div>
      </div>

      <div className="review-body">
        {/* SMS bubble — title still hidden on review */}
        <div className="sms-wrapper">
          <div className="sms-header">
            <span className="sms-dot" />
            <span className="sms-sender">SMS Message</span>
          </div>
          <div className="sms-bubble">
            <p className="sms-text">{question?.sms_text}</p>
          </div>
        </div>

        {/* User's completed sentence with chips */}
        <div className="review-sentence-section">
          <p className="fitb-instruction">Your answer:</p>
          <ReviewSentence parts={parts} responsePayload={response} />
        </div>

        {/* Score summary */}
        <div className={`review-summary ${typeCorrect ? 'review-summary--correct' : 'review-summary--wrong'}`}>
          <div className="review-type-result">
            <span className={`type-badge type-badge--${response.user_type_prediction}`}>
              {capitalise(response.user_type_prediction)}
            </span>
            {typeCorrect
              ? <span className="result-icon">✓ Correct message type</span>
              : <span className="result-icon result-icon--wrong">
                  ✗ Actual type: <strong>{capitalise(question?.true_type)}</strong>
                </span>
            }
          </div>
          {total > 0 && (
            <p className="review-score">
              Indicators: <strong>{tp} / {total}</strong> correct ({pct}%)
            </p>
          )}
        </div>

        {/* Correct answer explanation */}
        <div className="correct-answer-box">
          <p className="correct-answer-label">Correct answer</p>
          <p className="correct-answer-text">{question?.correct_answer_text}</p>
        </div>
      </div>

      <div className="review-footer">
        <button className="btn btn-primary btn-lg" onClick={onNext}>
          {currentIndex + 1 >= totalQuestions ? 'FINISH' : 'NEXT'}
        </button>
      </div>
    </div>
  );
}
