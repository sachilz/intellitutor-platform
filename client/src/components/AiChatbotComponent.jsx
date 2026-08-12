import React, { useState, useEffect, useRef } from 'react';

import { sendChatMessage, clearChatSession } from '../api/tutorApi';
import MarkdownRenderer from '../utils/markdownRenderer';
import {
  Bot,
  User,
  Send,
  Sparkles,
  Globe,
  BookOpen,
  Wrench,
  ExternalLink,
  RotateCcw,
  Layers,
  Cpu,
  Compass,
  Zap,
  FileText,
  BarChart3
} from 'lucide-react';

const getRecommendedCategories = (courseCategory) => {
  let learnQuestions = [
    'Explain the core concepts of this course',
    'What are the most important topics?',
    'Give me a summary of module 1',
    'What should I practice before the quiz?'
  ];

  if (courseCategory === 'GenAI') {
    learnQuestions = [
      'Explain Large Language Models (LLMs)',
      'What is Prompt Engineering?',
      'How does a Transformer architecture work?',
      'Explain Fine-Tuning vs RAG'
    ];
  } else if (courseCategory === 'AI & ML') {
    learnQuestions = [
      'Difference between Supervised & Unsupervised Learning?',
      'Explain Neural Networks simply',
      'What is Gradient Descent?',
      'How do Convolutional Neural Networks work?'
    ];
  } else if (courseCategory === 'Data Science') {
    learnQuestions = [
      'Key differences between pandas and NumPy?',
      'Explain the data cleaning process',
      'How do I handle missing data?',
      'What is Exploratory Data Analysis (EDA)?'
    ];
  } else if (courseCategory === 'Web Dev') {
    learnQuestions = [
      'Explain the difference between React and Angular',
      'What are React Hooks?',
      'Explain CSS Flexbox vs Grid',
      'How does Node.js event loop work?'
    ];
  } else if (courseCategory === 'DevOps & Cloud') {
    learnQuestions = [
      'What is CI/CD?',
      'Docker containers vs Virtual Machines',
      'How does Kubernetes orchestration work?',
      'Benefits of AWS serverless architecture?'
    ];
  } else if (courseCategory === 'Security') {
    learnQuestions = [
      'What is Cross-Site Scripting (XSS)?',
      'Explain SQL Injection and how to prevent it',
      'Difference between Authentication and Authorization?',
      'Explain public-key cryptography'
    ];
  } else if (!courseCategory || courseCategory === 'Computer Science' || courseCategory === 'Java' || courseCategory === 'Software Engineering') {
    learnQuestions = [
      'Explain polymorphism with a simple Java example',
      'What are the 4 pillars of Object-Oriented Programming?',
      'Explain Spring Boot dependency injection',
      'What is the difference between SQL and NoSQL databases?'
    ];
  }

  return [
    {
      id: 'LEARN',
      label: 'Learn',
      icon: BookOpen,
      color: '#818cf8',
      questions: learnQuestions
    },
    {
      id: 'PLATFORM',
      label: 'Platform',
      icon: Compass,
      color: '#34d399',
      questions: [
        'How does IntelliTutor track my learning progress?',
        'What happens when I submit a practice quiz?',
        'How do I bookmark and enroll in new courses?',
        'How does Keycloak authenticate student accounts?'
      ]
    },
    {
      id: 'ARCHITECTURE',
      label: 'Architecture',
      icon: Layers,
      color: '#fbbf24',
      questions: [
        'How does the API Gateway route microservice requests?',
        'Why does the gateway use Redis for rate limiting?',
        'How are all microservices orchestrated in Docker Compose?',
        'Why is my quiz request returning 401 Unauthorized?'
      ]
    },
    {
      id: 'AI',
      label: 'AI Capabilities',
      icon: Cpu,
      color: '#c084fc',
      questions: [
        'How does the AI Tutor use course document knowledge?',
        'When does the AI Assistant fetch live web sources?',
        'How does the chatbot remember our previous conversation?',
        'How does the AI Tutor diagnose technical platform errors?'
      ]
    }
  ];
};

export default function AiChatbotComponent({
  courseId = 'general',
  courseTitle = '',
  courseCategory = '',
  userId = 'student1@intellilearn.com'
}) {
  const [messages, setMessages] = useState(() => [
    {
      sender: 'ai',
      text: courseTitle
        ? `Welcome to **${courseTitle}**!\nI am your AI Assistant for this course. Ask me anything about course modules, technical concepts, practice quizzes, or learning paths.`
        : "Hi! I'm your **IntelliTutor AI Assistant**.\nAsk me anything about your courses, programming concepts, platform architecture, troubleshooting errors, or learning paths.",
      category: 'PROJECT_SPECIFIC',
      sourceType: 'PROJECT',
      webSearchUsed: false,
      sources: []
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => 'session-' + Math.random().toString(36).substring(2, 9));

  // Context-aware active category default
  const [activeCategory, setActiveCategory] = useState(() => {
    if (courseId && courseId !== 'general') return 'LEARN';
    return 'PLATFORM';
  });

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (queryText) => {
    const q = queryText || input;
    if (!q || !q.trim()) return;

    const userMsg = { sender: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendChatMessage(q, sessionId, courseId, userId, courseTitle, courseCategory);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: res.answer,
          category: res.category,
          sourceType: res.sourceType,
          webSearchUsed: res.webSearchUsed,
          sources: res.sources || [],
          troubleshooting: res.troubleshooting,
          providerUsed: res.providerUsed
        }
      ]);
    } catch (err) {
      console.error('AI Tutor API error:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: "I'm currently unable to connect to the IntelliTutor AI service. Please ensure the backend services are active.",
          category: 'GENERAL_KNOWLEDGE',
          sourceType: 'GENERAL',
          webSearchUsed: false,
          sources: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleResetSession = async () => {
    try {
      await clearChatSession(sessionId);
    } catch (e) {
      console.warn('Clear session warning:', e);
    }
    const newId = 'session-' + Math.random().toString(36).substring(2, 9);
    setSessionId(newId);
    setMessages([
      {
        sender: 'ai',
        text: `Conversation reset. How can I assist your study session for ${courseTitle || 'IntelliTutor'} today?`,
        category: 'PROJECT_SPECIFIC',
        sourceType: 'PROJECT',
        webSearchUsed: false,
        sources: []
      }
    ]);
  };

  const renderSourceBadge = (msg) => {
    if (msg.sender === 'user') return null;

    if (msg.category === 'PROJECT_TROUBLESHOOTING') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#fde68a', padding: '0.2rem 0.55rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 600, marginBottom: '6px' }}>
          <Wrench size={12} color="#fbbf24" /> Troubleshooter Mode
        </span>
      );
    }

    if (msg.webSearchUsed) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#7dd3fc', padding: '0.2rem 0.55rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 600, marginBottom: '6px' }}>
          <Globe size={12} color="#38bdf8" /> Web Source
        </span>
      );
    }

    if (msg.sourceType === 'PROJECT') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#c7d2fe', padding: '0.2rem 0.55rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 600, marginBottom: '6px' }}>
          <BookOpen size={12} color="#818cf8" /> {courseTitle ? courseTitle : 'IntelliTutor Course Material'}
        </span>
      );
    }

    return null;
  };


  const recommendedCategories = getRecommendedCategories(courseCategory);
  const currentCategoryData = recommendedCategories.find(c => c.id === activeCategory) || recommendedCategories[0];
  const activeQuestions = currentCategoryData.questions;

  return (
    <div
      style={{
        background: '#0f172a',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '1.25rem',
        color: '#f8fafc',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        height: '580px',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(99,102,241,0.25)' }}>
            <Bot size={22} color="#fff" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.01em' }}>
              IntelliTutor AI {courseTitle ? `— ${courseTitle}` : ''}
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>Your Course-Aware Intelligent Learning Assistant</span>
          </div>
        </div>
        <button
          onClick={handleResetSession}
          style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8', padding: '0.4rem 0.75rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s ease' }}
          title="Reset Conversation Memory"
        >
          <RotateCcw size={13} /> Reset Chat
        </button>
      </div>

      {/* Course Quick Action Bar */}
      {courseId && courseId !== 'general' && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          {[
            { text: `Explain ${courseTitle || 'Module 1'}`, icon: Zap },
            { text: 'Key concepts summary', icon: Sparkles },
            { text: 'Practice quiz', icon: FileText },
            { text: 'Study tips', icon: BarChart3 }
          ].map((chip, i) => (
            <button
              key={i}
              onClick={() => handleSend(chip.text)}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '0.35rem 0.7rem', borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.25)',
                color: '#c7d2fe', fontSize: '0.75rem', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.15s ease'
              }}
            >
              <chip.icon size={12} /> {chip.text}
            </button>
          ))}
        </div>
      )}

      {/* Redesigned Discovery & Recommendation Area */}
      <div style={{ marginBottom: '0.85rem', background: '#090d16', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '0.65rem 0.85rem' }}>
        {/* Category Selector Tabs */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '0.55rem', paddingBottom: '2px' }}>
          {recommendedCategories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '8px',
                  background: isActive ? 'rgba(99, 102, 241, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                  border: isActive ? `1px solid ${cat.color}60` : '1px solid rgba(255, 255, 255, 0.06)',
                  color: isActive ? cat.color : '#94a3b8',
                  fontSize: '0.75rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon size={12} color={isActive ? cat.color : '#64748b'} />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Question Pill Grid */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {activeQuestions.map((qText, i) => (
            <button
              key={i}
              onClick={() => handleSend(qText)}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#cbd5e1',
                padding: '0.35rem 0.7rem',
                borderRadius: '16px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.color = '#cbd5e1';
              }}
            >
              {qText}
            </button>
          ))}
        </div>
      </div>

      {/* Main Conversation Window */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '6px', display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '1rem' }}>
        {messages.map((m, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
            {renderSourceBadge(m)}
            <div style={{ display: 'flex', gap: '10px', maxWidth: '88%', flexDirection: m.sender === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: m.sender === 'user' ? '#6366f1' : '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px', border: '1px solid rgba(255,255,255,0.1)' }}>
                {m.sender === 'user' ? <User size={15} color="#fff" /> : <Bot size={15} color="#818cf8" />}
              </div>
              <div
                style={{
                  padding: '0.9rem 1.15rem',
                  borderRadius: m.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: m.sender === 'user' ? '#1e293b' : '#0f172a',
                  border: m.sender === 'user' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#f8fafc',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
              >
                <MarkdownRenderer content={m.text} />

                {/* Troubleshooting Advice Card */}
                {m.troubleshooting && (
                  <div style={{ marginTop: '0.85rem', padding: '0.85rem', background: '#090d16', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', fontSize: '0.82rem' }}>
                    <div style={{ color: '#fde68a', fontWeight: 700, marginBottom: '6px' }}>Likely Root Cause:</div>
                    <div style={{ color: '#cbd5e1', marginBottom: '8px' }}>{m.troubleshooting.likelyCause}</div>
                    <div style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '4px' }}>Recommended Checks:</div>
                    <ul style={{ margin: '0 0 8px 16px', padding: 0, color: '#94a3b8' }}>
                      {m.troubleshooting.recommendedChecks.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                    {m.troubleshooting.suggestedCommands && m.troubleshooting.suggestedCommands.length > 0 && (
                      <div style={{ background: '#020617', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>SUGGESTED DIAGNOSTIC COMMANDS</span>
                        {m.troubleshooting.suggestedCommands.map((cmd, i) => (
                          <code key={i} style={{ color: '#38bdf8', fontSize: '0.8rem', display: 'block' }}>$ {cmd}</code>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Sources / Citations List */}
                {m.sources && m.sources.length > 0 && (
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.6rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.76rem', color: '#94a3b8' }}>
                    <span style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Sources & References:</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {m.sources.map((src, i) => (
                        <a
                          key={i}
                          href={src.url.startsWith('http') ? src.url : '#'}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#818cf8', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '0.2rem 0.5rem', borderRadius: '6px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}
                        >
                          {src.title} {src.url.startsWith('http') && <ExternalLink size={11} />}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#818cf8', fontSize: '0.82rem', paddingLeft: '38px' }}>
            <span className="spinner"></span> Thinking...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ display: 'flex', gap: '10px' }}>
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Ask AI Tutor about ${courseTitle || 'this course or topics'}...`}
          style={{
            flex: 1,
            padding: '0.85rem 1.1rem',
            background: '#1e293b',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: '#f8fafc',
            fontSize: '0.9rem',
            outline: 'none',
            resize: 'none',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
            transition: 'all 0.2s ease',
          }}
          onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
          onBlur={e => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.target.style.boxShadow = 'none'; }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            padding: '0.85rem 1.4rem',
            background: loading ? '#475569' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
            transition: 'all 0.2s ease',
          }}
        >
          <Send size={16} /> Send
        </button>
      </form>
    </div>
  );
}
