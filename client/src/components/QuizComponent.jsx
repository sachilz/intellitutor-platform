import React, { useState, useEffect } from 'react';
import { getQuizzes, getQuizzesByCourse, submitQuiz, getQuizAttempts } from '../api/quizApi';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, AlertCircle, Award, RotateCcw, Clock, BookOpen } from 'lucide-react';

export default function QuizComponent({ courseId }) {
  const { user } = useAuth();
  const userId = user?.email || user?.username || 'student1@intellilearn.com';

  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadQuizzes();
  }, [courseId]);

  const loadQuizzes = async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (courseId && courseId !== 'general') {
        data = await getQuizzesByCourse(courseId);
      } else {
        data = await getQuizzes();
      }

      if (Array.isArray(data) && data.length > 0) {
        setQuizzes(data);
        setSelectedQuiz(data[0]);
        loadAttempts(data[0].id);
      } else {
        setQuizzes([]);
      }
    } catch (err) {
      console.warn('Failed to load quizzes:', err);
      const status = err.response?.status;
      if (status === 401) {
        setError('Your session has expired or requires authentication. Please sign in again.');
      } else if (status === 403) {
        setError('You do not have permission to access these quiz materials.');
      } else if (status === 404) {
        setQuizzes([]);
      } else if (status === 429) {
        setError('Too many requests to the Gateway. Please wait a moment and try again.');
      } else if (status >= 500) {
        setError('Quiz & Assessment service is temporarily unavailable.');
      } else {
        setError('Unable to reach IntelliTutor quiz service right now. Please verify service connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAttempts = async (quizId) => {
    try {
      const history = await getQuizAttempts(quizId, userId);
      if (Array.isArray(history)) {
        setAttempts(history);
      }
    } catch (err) {
      console.warn('Failed to load attempt history:', err);
    }
  };

  const handleQuizSelect = (quiz) => {
    setSelectedQuiz(quiz);
    setSelectedAnswers({});
    setResult(null);
    loadAttempts(quiz.id);
  };

  const handleOptionSelect = (questionIndex, optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedQuiz) return;

    const questionsCount = selectedQuiz.questions?.length || 0;
    const answeredCount = Object.keys(selectedAnswers).length;

    if (answeredCount < questionsCount) {
      alert(`Please answer all ${questionsCount} questions before submitting.`);
      return;
    }

    setSubmitting(true);
    try {
      const selectedOptions = selectedQuiz.questions.map((_, idx) => selectedAnswers[idx] ?? 0);
      const res = await submitQuiz(selectedQuiz.id, selectedOptions, userId);
      setResult(res);
      loadAttempts(selectedQuiz.id);
    } catch (err) {
      console.error('Quiz submission error:', err);
      alert('Failed to submit quiz attempt to backend server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setResult(null);
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
        <p>Loading Quiz & Assessment modules...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#fca5a5' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '8px' }}>
          <AlertCircle size={20} />
          <span>Quiz Service Notice</span>
        </div>
        <p style={{ fontSize: '0.9rem', margin: 0 }}>{error}</p>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
        <BookOpen size={28} style={{ opacity: 0.4, marginBottom: '8px' }} />
        <p style={{ margin: 0, fontWeight: 500 }}>No practice quizzes currently assigned for this course.</p>
      </div>
    );
  }

  return (
    <div className="quiz-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Quiz Selector Bar */}
      <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {quizzes.map((quiz) => (
          <button
            key={quiz.id}
            onClick={() => handleQuizSelect(quiz)}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '8px',
              border: selectedQuiz?.id === quiz.id ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
              background: selectedQuiz?.id === quiz.id ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.05)',
              color: '#f8fafc',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <BookOpen size={16} />
            <span>{quiz.title}</span>
          </button>
        ))}
      </div>

      {/* Active Quiz Area */}
      {selectedQuiz && (
        <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
            {selectedQuiz.title}
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {selectedQuiz.description}
          </p>

          {/* Submission Result View */}
          {result ? (
            <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '1.5rem', borderRadius: '12px', border: '1px solid #6366f1' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Award size={28} color="#818cf8" />
                  <div>
                    <h4 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem' }}>Assessment Results</h4>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Score: {result.score}%</span>
                  </div>
                </div>
                <button
                  onClick={handleRetake}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#6366f1',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <RotateCcw size={16} /> Retake Quiz
                </button>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <p style={{ color: '#e2e8f0', fontWeight: 600, margin: '0 0 0.5rem 0' }}>Feedback:</p>
                <p style={{ color: '#cbd5e1', fontSize: '0.95rem', margin: 0 }}>{result.feedback}</p>
              </div>

              {result.recommendations && result.recommendations.length > 0 && (
                <div>
                  <p style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: '0.5rem' }}>Recommendations:</p>
                  <ul style={{ paddingLeft: '1.2rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx} style={{ marginBottom: '4px' }}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            /* Questions Form */
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {selectedQuiz.questions?.map((q, qIdx) => (
                <div key={qIdx} style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '1.25rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ color: '#f8fafc', fontWeight: 600, fontSize: '1rem', marginBottom: '1rem' }}>
                    {qIdx + 1}. {q.text}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {q.options?.map((opt, optIdx) => (
                      <label
                        key={optIdx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '0.75rem 1rem',
                          borderRadius: '6px',
                          background: selectedAnswers[qIdx] === optIdx ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255,255,255,0.03)',
                          border: selectedAnswers[qIdx] === optIdx ? '1px solid #6366f1' : '1px solid transparent',
                          color: '#e2e8f0',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="radio"
                          name={`question_${qIdx}`}
                          checked={selectedAnswers[qIdx] === optIdx}
                          onChange={() => handleOptionSelect(qIdx, optIdx)}
                          style={{ accentColor: '#6366f1' }}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '0.8rem 1.5rem',
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  alignSelf: 'flex-start',
                }}
              >
                {submitting ? 'Evaluating Submission...' : 'Submit Answers'}
              </button>
            </form>
          )}

          {/* Persisted Attempt History */}
          {attempts.length > 0 && (
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', fontWeight: 600, marginBottom: '1rem' }}>
                <Clock size={18} />
                <span>Persisted MongoDB Attempt History</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {attempts.map((att, index) => (
                  <div key={att.id || index} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(15,23,42,0.6)', borderRadius: '6px', fontSize: '0.85rem', color: '#94a3b8' }}>
                    <span>Score: <strong style={{ color: att.score >= 70 ? '#4ade80' : '#f87171' }}>{att.score}%</strong> ({att.correctAnswersCount}/{att.totalQuestions} correct)</span>
                    <span>Date: {att.submittedAt ? new Date(att.submittedAt).toLocaleString() : 'Recent'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
