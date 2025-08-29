import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Progress } from './components/ui/progress';
import { RotateCcw, Play, Pause, Timer, Target, Zap } from 'lucide-react';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

function App() {
  // Core state
  const [practiceText, setPracticeText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [currentPosition, setCurrentPosition] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  
  // Stats state
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [mistakes, setMistakes] = useState(0);
  const [difficulty, setDifficulty] = useState('medium');
  
  // Loading state
  const [loading, setLoading] = useState(false);
  
  // Refs
  const inputRef = useRef(null);
  const intervalRef = useRef(null);

  // Fetch practice text
  const fetchPracticeText = useCallback(async (selectedDifficulty = difficulty) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/practice-text?difficulty=${selectedDifficulty}`);
      setPracticeText(response.data.text);
      setDifficulty(response.data.difficulty);
      resetSession();
    } catch (error) {
      console.error('Error fetching practice text:', error);
      // Fallback text
      setPracticeText('The quick brown fox jumps over the lazy dog. This is a fallback text for practice.');
    } finally {
      setLoading(false);
    }
  }, [difficulty]);

  // Reset session
  const resetSession = useCallback(() => {
    setUserInput('');
    setCurrentPosition(0);
    setIsActive(false);
    setIsCompleted(false);
    setStartTime(null);
    setTimeElapsed(0);
    setWpm(0);
    setAccuracy(100);
    setMistakes(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Calculate stats
  const calculateStats = useCallback(() => {
    if (!startTime) return;

    const currentTime = Date.now();
    const elapsed = (currentTime - startTime) / 1000 / 60; // minutes
    setTimeElapsed(elapsed * 60); // seconds for display

    if (elapsed > 0) {
      const wordsTyped = userInput.length / 5;
      const currentWpm = Math.round(wordsTyped / elapsed);
      setWpm(currentWpm);
    }

    // Calculate accuracy
    let correct = 0;
    let errors = 0;
    
    for (let i = 0; i < userInput.length; i++) {
      if (i < practiceText.length) {
        if (userInput[i] === practiceText[i]) {
          correct++;
        } else {
          errors++;
        }
      } else {
        errors++;
      }
    }

    const totalTyped = userInput.length;
    const currentAccuracy = totalTyped > 0 ? Math.round((correct / totalTyped) * 100) : 100;
    setAccuracy(currentAccuracy);
    setMistakes(errors);
  }, [startTime, userInput, practiceText]);

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    
    // Start timer on first keystroke
    if (!isActive && value.length === 1) {
      setIsActive(true);
      setStartTime(Date.now());
    }

    // Prevent typing beyond text length
    if (value.length <= practiceText.length) {
      setUserInput(value);
      setCurrentPosition(value.length);

      // Check if completed
      if (value.length === practiceText.length && value === practiceText) {
        setIsCompleted(true);
        setIsActive(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        // Final stats calculation
        calculateStats();
        saveResult(value);
      }
    }
  };

  // Save result to backend
  const saveResult = async (finalInput) => {
    try {
      const finalTime = timeElapsed || (Date.now() - startTime) / 1000;
      const finalWpm = Math.round((finalInput.length / 5) / (finalTime / 60));
      const finalAccuracy = Math.round((finalInput.split('').filter((char, i) => char === practiceText[i]).length / practiceText.length) * 100);

      await axios.post(`${API_BASE_URL}/api/results`, {
        wpm: finalWpm,
        accuracy: finalAccuracy,
        time_taken: finalTime,
        characters_typed: finalInput.length,
        mistakes: mistakes,
        text_length: practiceText.length
      });
    } catch (error) {
      console.error('Error saving result:', error);
    }
  };

  // Timer effect
  useEffect(() => {
    if (isActive && !isCompleted) {
      intervalRef.current = setInterval(calculateStats, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isCompleted, calculateStats]);

  // Initialize on mount
  useEffect(() => {
    fetchPracticeText();
  }, []);

  // Render character with styling
  const renderCharacter = (char, index) => {
    let className = 'character';
    
    if (index < userInput.length) {
      className += userInput[index] === char ? ' correct' : ' incorrect';
    } else if (index === currentPosition) {
      className += ' current';
    }

    return (
      <span key={index} className={className}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    );
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1 className="title">
            <Zap className="title-icon" />
            Click — A Typing Speed Game
          </h1>
          <p className="subtitle">Practice typing with live WPM, accuracy, and progress</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Stats Bar */}
        <div className="stats-bar">
          <div className="stat-item">
            <Timer className="stat-icon" />
            <span className="stat-value">{Math.round(timeElapsed)}s</span>
            <span className="stat-label">Time</span>
          </div>
          <div className="stat-item">
            <Zap className="stat-icon" />
            <span className="stat-value">{wpm}</span>
            <span className="stat-label">WPM</span>
          </div>
          <div className="stat-item">
            <Target className="stat-icon" />
            <span className="stat-value">{accuracy}%</span>
            <span className="stat-label">Accuracy</span>
          </div>
        </div>

        {/* Typing Area */}
        <Card className="typing-card">
          <CardHeader>
            <div className="card-header-content">
              <CardTitle>Practice Text</CardTitle>
              <div className="difficulty-controls">
                <select 
                  value={difficulty} 
                  onChange={(e) => fetchPracticeText(e.target.value)}
                  className="difficulty-select"
                  disabled={isActive}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fetchPracticeText()}
                  disabled={loading || isActive}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="loading">Loading new text...</div>
            ) : (
              <>
                {/* Progress Bar */}
                <div className="progress-container">
                  <Progress 
                    value={(currentPosition / practiceText.length) * 100} 
                    className="progress-bar"
                  />
                  <span className="progress-text">
                    {currentPosition} / {practiceText.length} characters
                  </span>
                </div>

                {/* Text Display */}
                <div className="text-display">
                  {practiceText.split('').map((char, index) => renderCharacter(char, index))}
                </div>

                {/* Input Area */}
                <div className="input-container">
                  <textarea
                    ref={inputRef}
                    value={userInput}
                    onChange={handleInputChange}
                    className="typing-input"
                    placeholder={isCompleted ? "Great job! Click restart to try again." : "Start typing here..."}
                    disabled={isCompleted}
                    autoFocus
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {isCompleted && (
          <Card className="results-card">
            <CardHeader>
              <CardTitle>Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="results-grid">
                <div className="result-item">
                  <div className="result-value">{wpm}</div>
                  <div className="result-label">Words per minute</div>
                </div>
                <div className="result-item">
                  <div className="result-value">{accuracy}%</div>
                  <div className="result-label">Accuracy</div>
                </div>
                <div className="result-item">
                  <div className="result-value">{mistakes}</div>
                  <div className="result-label">Mistakes</div>
                </div>
                <div className="result-item">
                  <div className="result-value">{Math.round(timeElapsed)}s</div>
                  <div className="result-label">Time taken</div>
                </div>
              </div>
              <div className="results-actions">
                <Button onClick={resetSession} className="restart-button">
                  <Play className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button variant="outline" onClick={() => fetchPracticeText()}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  New Text
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

export default App;