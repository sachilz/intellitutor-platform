import React, { useState } from 'react';
import { createCourse } from '../api/courseApi';
import { createQuiz } from '../api/quizApi';
import { X, Plus, BookOpen, Award, FileText, CheckCircle2 } from 'lucide-react';

export default function InstructorModal({ isOpen, onClose, onRefresh }) {
  const [activeTab, setActiveTab] = useState('COURSE');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  // Course Form State
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: 'Computer Science',
    instructor: 'Prof. Chamod',
  });

  // Quiz Form State
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    questionText: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctIndex: 0,
  });

  if (!isOpen) return null;

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    try {
      await createCourse({
        title: courseForm.title,
        description: courseForm.description,
        category: courseForm.category,
        instructor: courseForm.instructor,
        modules: [
          { title: 'Module 1: Foundations', completedPercent: 0 },
          { title: 'Module 2: Advanced Topics', completedPercent: 0 },
        ],
      });
      setSuccessMsg('New Course successfully published to platform!');
      setCourseForm({ title: '', description: '', category: 'Computer Science', instructor: 'Prof. Chamod' });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Course creation error:', err);
      alert('Failed to publish course to backend course-service.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    try {
      await createQuiz({
        title: quizForm.title,
        description: quizForm.description,
        questions: [
          {
            text: quizForm.questionText,
            options: [quizForm.option1, quizForm.option2, quizForm.option3, quizForm.option4],
            correctOptionIndex: parseInt(quizForm.correctIndex, 10),
          },
        ],
      });
      setSuccessMsg('New Assessment Quiz successfully published to platform!');
      setQuizForm({
        title: '',
        description: '',
        questionText: '',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        correctIndex: 0,
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Quiz creation error:', err);
      alert('Failed to publish assessment to backend quiz-service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '650px',
          background: '#0f172a',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '16px',
          padding: '1.75rem',
          color: '#f8fafc',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award color="#818cf8" size={24} />
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Instructor Authoring Console</h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
          <button
            onClick={() => { setActiveTab('COURSE'); setSuccessMsg(null); }}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'COURSE' ? '#6366f1' : 'transparent',
              color: activeTab === 'COURSE' ? '#fff' : '#94a3b8',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <BookOpen size={16} /> Create Course
          </button>
          <button
            onClick={() => { setActiveTab('QUIZ'); setSuccessMsg(null); }}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'QUIZ' ? '#6366f1' : 'transparent',
              color: activeTab === 'QUIZ' ? '#fff' : '#94a3b8',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Plus size={16} /> Create Quiz Assessment
          </button>
        </div>

        {successMsg && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', color: '#4ade80', fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab 1: Create Course Form */}
        {activeTab === 'COURSE' && (
          <form onSubmit={handleCourseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Course Title</label>
              <input
                type="text"
                required
                value={courseForm.title}
                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                placeholder="e.g. Microservices Architecture & Spring Boot"
                style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Description</label>
              <textarea
                rows={3}
                required
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                placeholder="Detailed syllabus description..."
                style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Category</label>
                <select
                  value={courseForm.category}
                  onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Web Development">Web Development</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Instructor Name</label>
                <input
                  type="text"
                  required
                  value={courseForm.instructor}
                  onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '0.5rem',
                padding: '0.75rem 1.25rem',
                background: '#6366f1',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Publishing Course...' : 'Publish Course'}
            </button>
          </form>
        )}

        {/* Tab 2: Create Quiz Form */}
        {activeTab === 'QUIZ' && (
          <form onSubmit={handleQuizSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Quiz Title</label>
              <input
                type="text"
                required
                value={quizForm.title}
                onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                placeholder="e.g. Distributed Systems Quiz"
                style={{ width: '100%', padding: '0.6rem 0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Question 1</label>
              <input
                type="text"
                required
                value={quizForm.questionText}
                onChange={(e) => setQuizForm({ ...quizForm, questionText: e.target.value })}
                placeholder="e.g. Which HTTP method is idempotent for updates?"
                style={{ width: '100%', padding: '0.6rem 0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <input
                type="text"
                required
                placeholder="Option 1"
                value={quizForm.option1}
                onChange={(e) => setQuizForm({ ...quizForm, option1: e.target.value })}
                style={{ padding: '0.55rem 0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
              />
              <input
                type="text"
                required
                placeholder="Option 2"
                value={quizForm.option2}
                onChange={(e) => setQuizForm({ ...quizForm, option2: e.target.value })}
                style={{ padding: '0.55rem 0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
              />
              <input
                type="text"
                required
                placeholder="Option 3"
                value={quizForm.option3}
                onChange={(e) => setQuizForm({ ...quizForm, option3: e.target.value })}
                style={{ padding: '0.55rem 0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
              />
              <input
                type="text"
                required
                placeholder="Option 4"
                value={quizForm.option4}
                onChange={(e) => setQuizForm({ ...quizForm, option4: e.target.value })}
                style={{ padding: '0.55rem 0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Correct Option Index</label>
              <select
                value={quizForm.correctIndex}
                onChange={(e) => setQuizForm({ ...quizForm, correctIndex: e.target.value })}
                style={{ width: '100%', padding: '0.6rem 0.85rem', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
              >
                <option value={0}>Option 1 (Index 0)</option>
                <option value={1}>Option 2 (Index 1)</option>
                <option value={2}>Option 3 (Index 2)</option>
                <option value={3}>Option 4 (Index 3)</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '0.5rem',
                padding: '0.75rem 1.25rem',
                background: '#6366f1',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Publishing Assessment...' : 'Publish Assessment'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
