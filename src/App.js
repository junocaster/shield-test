import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import LandingPage from './components/LandingPage';
import InstructionsPage from './components/InstructionsPage';
import QuestionCard from './components/QuestionCard';
import ReviewCard from './components/ReviewCard';
import EndPage from './components/EndPage';
import './App.css';

/** Fisher-Yates shuffle — returns a new shuffled array */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Screens: 'landing' → 'instructions' → 'question' → 'review' → ... → 'end'
export default function App() {
  const [screen, setScreen] = useState('landing');
  const [questions, setQuestions] = useState([]);   // shuffled order
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Session state — BIGINT from DB, so stored as a JS number
  const [sessionId, setSessionId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Per-question state passed to ReviewCard
  const [lastResponse, setLastResponse] = useState(null);

  // Load all 20 questions once on mount, then shuffle
  useEffect(() => {
    async function loadQuestions() {
      try {
        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .order('question_number', { ascending: true });

        if (error) throw error;
        setQuestions(shuffle(data));   // ← randomise order here
      } catch (err) {
        setError('Failed to load questions. Please refresh the page.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, []);

  // Create a new session row when START is pressed
  async function handleStart() {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert({ user_agent: navigator.userAgent })
        .select('id')
        .single();

      if (error) throw error;
      setSessionId(data.id);   // integer, e.g. 1, 2, 3 …
      setCurrentIndex(0);
      setScreen('question');
    } catch (err) {
      setError('Could not start session. Please refresh and try again.');
      console.error(err);
    }
  }

  // Called by QuestionCard on CONFIRM
  // responsePayload = columns for Supabase; userAnswers = raw selections for ReviewCard
  async function handleConfirm(responsePayload, userAnswers) {
    try {
      const { error } = await supabase.from('responses').insert(responsePayload);
      if (error) throw error;
    } catch (err) {
      console.error('Failed to save response:', err);
    }
    // Always advance — don't block user if DB insert fails
    setLastResponse({
      ...responsePayload,
      _userAnswers: userAnswers,
      question: questions[currentIndex],
    });
    setScreen('review');
  }

  // Called by ReviewCard on NEXT / FINISH
  async function handleNext() {
    const nextIndex = currentIndex + 1;

    if (nextIndex >= questions.length) {
      if (sessionId) {
        await supabase
          .from('sessions')
          .update({ is_complete: true, completed_at: new Date().toISOString() })
          .eq('id', sessionId);
      }
      setScreen('end');
    } else {
      setCurrentIndex(nextIndex);
      setScreen('question');
    }
  }

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner" />
        <p>Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="app">
      {screen === 'landing' && (
        <LandingPage onProceed={() => setScreen('instructions')} />
      )}
      {screen === 'instructions' && (
        <InstructionsPage onStart={handleStart} />
      )}
      {screen === 'question' && questions.length > 0 && (
        <QuestionCard
          key={currentIndex}
          question={questions[currentIndex]}
          sessionId={sessionId}
          interactionNum={currentIndex + 1}
          totalQuestions={questions.length}
          onConfirm={handleConfirm}
        />
      )}
      {screen === 'review' && lastResponse && (
        <ReviewCard
          response={lastResponse}
          currentIndex={currentIndex}
          totalQuestions={questions.length}
          onNext={handleNext}
        />
      )}
      {screen === 'end' && <EndPage onExit={() => setScreen('landing')} />}
    </div>
  );
}
